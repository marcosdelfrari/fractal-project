const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");
const bcrypt = require("bcryptjs");

/**
 * Controller para gerenciamento de perfil do usuário
 * Implementa GET e PUT para /api/users/:id/profile
 */
class UserProfileController {
  /**
   * Busca o perfil de um usuário específico
   * GET /api/users/:id/profile
   */
  async getUserProfile(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório",
        });
      }

      // Buscar usuário com dados relacionados
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          cpf: true,
          photo: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Incluir contadores relacionados
          _count: {
            select: {
              addresses: true,
              reviews: true,
              Wishlist: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      // Remover campos sensíveis e formatar resposta
      const userProfile = {
        ...user,
        stats: {
          totalAddresses: user._count.addresses,
          totalReviews: user._count.reviews,
          totalWishlist: user._count.Wishlist,
        },
      };

      // Remover _count da resposta
      delete userProfile._count;

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Atualiza o perfil de um usuário
   * PUT /api/users/:id/profile
   */
  async updateUserProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, cpf, photo, currentPassword, newPassword } =
        req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório",
        });
      }

      // Verificar se usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          phone: true,
          cpf: true,
          photo: true,
          role: true,
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      // Preparar dados para atualização
      const updateData = {};

      // Validar e atualizar nome
      if (name !== undefined) {
        const validatedName = name.trim();
        if (validatedName.length < 2 || validatedName.length > 100) {
          return res.status(400).json({
            success: false,
            message: "Nome deve ter entre 2 e 100 caracteres",
          });
        }
        updateData.name = validatedName;
      }

      // Validar e atualizar telefone
      if (phone !== undefined) {
        if (phone && phone.trim()) {
          const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
          if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({
              success: false,
              message: "Formato de telefone inválido. Use: (11) 99999-9999",
            });
          }
          updateData.phone = phone.trim();
        } else {
          updateData.phone = null;
        }
      }

      // Validar e atualizar CPF
      if (cpf !== undefined) {
        if (cpf && cpf.trim()) {
          const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
          if (!cpfRegex.test(cpf.trim())) {
            return res.status(400).json({
              success: false,
              message: "Formato de CPF inválido. Use: 000.000.000-00",
            });
          }
          updateData.cpf = cpf.trim();
        } else {
          updateData.cpf = null;
        }
      }

      // Validar e atualizar foto
      if (photo !== undefined) {
        if (photo && photo.trim()) {
          // Validação básica de URL de imagem
          const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
          if (!urlRegex.test(photo.trim())) {
            return res.status(400).json({
              success: false,
              message:
                "URL da foto deve ser válida e terminar com extensão de imagem",
            });
          }
          updateData.photo = photo.trim();
        } else {
          updateData.photo = null;
        }
      }

      // Processar mudança de senha se fornecida
      if (newPassword !== undefined) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: "Senha atual é obrigatória para alterar a senha",
          });
        }

        // Verificar senha atual
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          existingUser.password
        );

        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            message: "Senha atual incorreta",
          });
        }

        // Validar nova senha
        if (newPassword.length < 8) {
          return res.status(400).json({
            success: false,
            message: "Nova senha deve ter pelo menos 8 caracteres",
          });
        }

        // Hash da nova senha
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(newPassword, saltRounds);
      }

      // Atualizar usuário no banco
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          cpf: true,
          photo: true,
          role: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Perfil atualizado com sucesso",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Busca estatísticas do usuário
   * GET /api/users/:id/stats
   */
  async getUserStats(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório",
        });
      }

      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      // Buscar estatísticas
      const [totalAddresses, totalReviews, totalWishlist] = await Promise.all([
        prisma.address.count({ where: { userId: id } }),
        prisma.review.count({ where: { userId: id } }),
        prisma.Wishlist.count({ where: { userId: id } }),
      ]);

      const stats = {
        addresses: {
          total: totalAddresses,
          default: await prisma.address.count({
            where: { userId: id, isDefault: true },
          }),
        },
        reviews: {
          total: totalReviews,
          average:
            totalReviews > 0
              ? await prisma.review.aggregate({
                  where: { userId: id },
                  _avg: { rating: true },
                })
              : { _avg: { rating: 0 } },
        },
        wishlist: {
          total: totalWishlist,
        },
        orders: {
          total: 0,
          totalSpent: 0,
        },
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas do usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

module.exports = new UserProfileController();
