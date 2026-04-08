import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { sanitizeInput, commonValidations } from "@/utils/validation";

/** Janela alinhada ao `authLimiter` do Express (15 min). IP: anti-abuso em massa; e-mail: anti-spam por destino. */
const PIN_WINDOW_MS = 15 * 60 * 1000;
const PIN_MAX_PER_IP = 10;
const PIN_MAX_PER_EMAIL = 5;

// Inicialização lazy do Resend para evitar erro durante build
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "⚠️ RESEND_API_KEY não configurada - emails não serão enviados",
    );
    return null;
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
  try {
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (
      !commonValidations.checkRateLimit(
        `send-pin:ip:${clientIP}`,
        PIN_MAX_PER_IP,
        PIN_WINDOW_MS,
      )
    ) {
      return NextResponse.json(
        { error: "Muitas solicitações. Tente novamente em alguns minutos." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }

    const body = await sanitizeInput.validateJsonInput(request);
    const emailRaw =
      body && typeof body === "object"
        ? (body as { email?: unknown }).email
        : undefined;

    const emailParsed = commonValidations.email.safeParse(
      typeof emailRaw === "string" ? emailRaw : "",
    );
    if (!emailParsed.success) {
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
    }
    const email = emailParsed.data;

    if (
      !commonValidations.checkRateLimit(
        `send-pin:email:${email}`,
        PIN_MAX_PER_EMAIL,
        PIN_WINDOW_MS,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Muitas solicitações de PIN para este e-mail. Tente novamente mais tarde.",
        },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }

    // Gerar PIN de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Salvar PIN no banco de dados com expiração de 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await prisma.pinVerification.upsert({
        where: {
          email: email,
        },
        update: {
          pin: pin,
          expiresAt: expiresAt,
          attempts: 0,
        },
        create: {
          id: nanoid(),
          email: email,
          pin: pin,
          expiresAt: expiresAt,
          attempts: 0,
        },
      });
    } catch (dbError) {
      console.error("Erro no banco de dados:", dbError);
      // Continuar mesmo se o banco falhar
    }

    // Enviar PIN por email usando Resend
    try {
      const resend = getResend();
      if (!resend) {
        console.warn("⚠️ Resend não configurado para envio de PIN");
        return NextResponse.json(
          { error: "Serviço de email indisponível" },
          { status: 503 },
        );
      }
      const emailResult = await resend.emails.send({
        from: "Vagabundo Iluminado <test@resend.dev>",
        to: [email],
        subject: "Seu PIN de acesso - Vagabundo Iluminado",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1f2937;">🔐 Vagabundo Iluminado</h2>
            <h3>Seu PIN de acesso</h3>
            <p>Olá!</p>
            <p>Você solicitou um PIN para fazer login na sua conta. Use o código abaixo:</p>
            
            <div style="background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p><strong>Seu PIN de acesso:</strong></p>
              <div style="font-size: 2rem; font-weight: bold; letter-spacing: 0.5rem; color: #1f2937; margin: 10px 0;">${pin}</div>
              <p><small>Este código expira em 10 minutos</small></p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 20px 0;">
              <p><strong>⚠️ Importante:</strong></p>
              <ul>
                <li>Este PIN é válido por apenas 10 minutos</li>
                <li>Use-o apenas uma vez</li>
                <li>Não compartilhe este código com ninguém</li>
                <li>Se você não solicitou este PIN, ignore este email</li>
              </ul>
            </div>
            
            <p>Se você não conseguir fazer login, pode solicitar um novo PIN na página de login.</p>
            
            <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9rem;">
              <p>Este é um email automático, não responda a esta mensagem.</p>
              <p>© 2024 Vagabundo Iluminado - Todos os direitos reservados</p>
            </div>
          </div>
        `,
        text: `
PIN de Acesso - Vagabundo Iluminado

Olá!

Você solicitou um PIN para fazer login na sua conta.

Seu PIN de acesso: ${pin}

Este código expira em 10 minutos.

IMPORTANTE:
- Este PIN é válido por apenas 10 minutos
- Use-o apenas uma vez
- Não compartilhe este código com ninguém
- Se você não solicitou este PIN, ignore este email

Se você não conseguir fazer login, pode solicitar um novo PIN na página de login.

Este é um email automático, não responda a esta mensagem.

© 2024 Vagabundo Iluminado - Todos os direitos reservados
        `,
      });

      console.log("📧 Email enviado com sucesso:", emailResult);
    } catch (emailError) {
      console.error("⚠️ Erro ao enviar email:", emailError);
    }

    return NextResponse.json(
      { message: "PIN enviado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
