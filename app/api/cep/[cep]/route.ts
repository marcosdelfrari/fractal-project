import { NextRequest, NextResponse } from "next/server";

type ViaCepResponse = {
  erro?: boolean;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  complemento?: string;
  ibge?: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cep: string }> },
) {
  try {
    const { cep } = await params;
    const cepDigits = (cep || "").replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Falha ao consultar CEP" }, { status: 500 });
    }

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      cep: (data.cep || cepDigits).replace(/\D/g, ""),
      tipoCep: "",
      subTipoCep: "",
      uf: data.uf || "",
      cidade: data.localidade || "",
      bairro: data.bairro || "",
      endereco: data.logradouro || "",
      complemento: data.complemento || "",
      codigoIBGE: data.ibge || "",
    });
  } catch (error) {
    console.error("API CEP (ViaCEP):", error);
    return NextResponse.json({ error: "Falha ao consultar CEP" }, { status: 500 });
  }
}
