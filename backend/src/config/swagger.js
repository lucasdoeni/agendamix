import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AgendaMix API - Documentação Interativa',
    version: '1.0.0',
    description: `API RESTful do sistema **AgendaMix**, uma plataforma completa de agendamentos online para profissionais autônomos, barbearias, salões de beleza, clínicas e clientes.

### Recursos:
* **Autenticação**: Login e cadastro unificado para profissionais e clientes.
* **Profissionais**: Gestão de perfil, fotos (avatar/capa), serviços e horários.
* **Agendamentos**: Criação, cancelamento e atualização de status em tempo real.
* **Administração**: Painel master para gerenciamento de usuários e formas de pagamento.
* **Uploads**: Armazenamento de mídias e fotos de perfil.`,
    contact: {
      name: 'Equipe AgendaMix',
      url: 'https://lucasdoeni.github.io/agendamix/'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Ambiente Local (Desenvolvimento)'
    },
    {
      url: 'https://agendamix.onrender.com',
      description: 'Ambiente de Produção (Render Cloud)'
    }
  ],
  tags: [
    { name: 'Status & Diagnóstico', description: 'Monitoramento da saúde da API e conectividade' },
    { name: 'Autenticação', description: 'Endpoints para login e cadastro de contas' },
    { name: 'Profissionais', description: 'Consulta pública e atualização de perfil do profissional' },
    { name: 'Serviços', description: 'Gerenciamento do catálogo de serviços do profissional' },
    { name: 'Horários & Bloqueios', description: 'Gestão da grade de disponibilidade e bloqueios de agenda' },
    { name: 'Agendamentos', description: 'Fluxo de reservas, listagens e alteração de status' },
    { name: 'Uploads', description: 'Envio e armazenamento de fotos (JPG, PNG, WEBP)' },
    { name: 'Administração', description: 'Painel administrativo master e manutenção da plataforma' }
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Status & Diagnóstico'],
        summary: 'Verifica o status da API',
        description: 'Retorna o estado operacional do backend e timestamp atual. Ideal para monitoramento e keep-alive.',
        responses: {
          200: {
            description: 'API operando normalmente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'online' },
                    message: { type: 'string', example: 'AgendaMix Backend API em funcionamento com MySQL' },
                    environment: { type: 'string', example: 'production' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Realiza login de profissional ou cliente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', description: 'E-mail ou nome de usuário', example: 'joao.silva@email.com' },
                  password: { type: 'string', format: 'password', example: 'senha123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Autenticado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', example: 'mock-jwt-token-123456' }
                  }
                }
              }
            }
          },
          401: { description: 'Credenciais inválidas' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra um novo profissional',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterProfessionalInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Profissional registrado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    professional: { $ref: '#/components/schemas/Professional' }
                  }
                }
              }
            }
          },
          400: { description: 'Dados incompletos ou e-mail/usuário já em uso' }
        }
      }
    },
    '/api/auth/register-client': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra um novo cliente final',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'phone', 'password'],
                properties: {
                  name: { type: 'string', example: 'Maria Santos' },
                  email: { type: 'string', format: 'email', example: 'maria@email.com' },
                  phone: { type: 'string', example: '(11) 98765-4321' },
                  password: { type: 'string', format: 'password', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Cliente registrado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          400: { description: 'Dados incompletos ou usuário já cadastrado' }
        }
      }
    },
    '/api/auth/client-profile': {
      put: {
        tags: ['Autenticação'],
        summary: 'Atualiza o perfil de um cliente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: { type: 'string', example: 'client-uuid-123' },
                  name: { type: 'string', example: 'Maria Santos Atualizada' },
                  email: { type: 'string', example: 'maria.nova@email.com' },
                  phone: { type: 'string', example: '(11) 99999-8888' },
                  avatar: { type: 'string', example: 'https://images.unsplash.com/...' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Perfil atualizado com sucesso' },
          404: { description: 'Cliente não encontrado' }
        }
      }
    },
    '/api/professionals': {
      get: {
        tags: ['Profissionais'],
        summary: 'Lista todos os profissionais disponíveis',
        responses: {
          200: {
            description: 'Lista de profissionais cadastrados',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Professional' }
                }
              }
            }
          }
        }
      }
    },
    '/api/professionals/{id}': {
      get: {
        tags: ['Profissionais'],
        summary: 'Obtém detalhes de um profissional pelo ID ou slug',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID ou slug do profissional', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Detalhes completos do profissional',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Professional' }
              }
            }
          },
          404: { description: 'Profissional não encontrado' }
        }
      }
    },
    '/api/professionals/{id}/avatar': {
      put: {
        tags: ['Profissionais'],
        summary: 'Atualiza a foto de avatar do profissional',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['avatarUrl'],
                properties: { avatarUrl: { type: 'string', example: 'https://exemplo.com/avatar.jpg' } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Avatar atualizado com sucesso' }
        }
      }
    },
    '/api/professionals/{id}/cover': {
      put: {
        tags: ['Profissionais'],
        summary: 'Atualiza a foto de capa do profissional',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['coverUrl'],
                properties: { coverUrl: { type: 'string', example: 'https://exemplo.com/capa.jpg' } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Foto de capa atualizada com sucesso' }
        }
      }
    },
    '/api/professionals/{proId}/services': {
      post: {
        tags: ['Serviços'],
        summary: 'Adiciona um novo serviço ao catálogo do profissional',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Serviço criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Service' }
              }
            }
          }
        }
      }
    },
    '/api/professionals/{proId}/services/{serviceId}': {
      put: {
        tags: ['Serviços'],
        summary: 'Atualiza um serviço existente',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'serviceId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServiceInput' }
            }
          }
        },
        responses: {
          200: { description: 'Serviço atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Serviços'],
        summary: 'Remove um serviço do catálogo',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'serviceId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Serviço removido com sucesso' }
        }
      }
    },
    '/api/professionals/{proId}/schedule': {
      put: {
        tags: ['Horários & Bloqueios'],
        summary: 'Atualiza a grade semanal de funcionamento do profissional',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Mapa de dias da semana e intervalos de horário',
                example: {
                  monday: { active: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
                  saturday: { active: true, intervals: [{ start: '08:00', end: '14:00' }] },
                  sunday: { active: false, intervals: [] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Grade de horários atualizada com sucesso' }
        }
      }
    },
    '/api/professionals/{proId}/blocked-slots': {
      post: {
        tags: ['Horários & Bloqueios'],
        summary: 'Adiciona um bloqueio temporário na agenda (férias, folga, imprevisto)',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date', 'time'],
                properties: {
                  date: { type: 'string', format: 'date', example: '2026-10-10' },
                  time: { type: 'string', example: '14:00' },
                  reason: { type: 'string', example: 'Consulta médica' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Bloqueio registrado com sucesso' }
        }
      }
    },
    '/api/professionals/{proId}/blocked-slots/{slotId}': {
      delete: {
        tags: ['Horários & Bloqueios'],
        summary: 'Remove um bloqueio de horário',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'slotId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Bloqueio removido com sucesso' }
        }
      }
    },
    '/api/professionals/{proId}/bookings': {
      get: {
        tags: ['Agendamentos'],
        summary: 'Lista todos os agendamentos vinculados a um profissional',
        parameters: [
          { name: 'proId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Lista de agendamentos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Booking' }
                }
              }
            }
          }
        }
      }
    },
    '/api/bookings': {
      post: {
        tags: ['Agendamentos'],
        summary: 'Cria uma nova reserva/agendamento',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['professionalId', 'serviceId', 'date', 'time', 'clientName', 'clientPhone'],
                properties: {
                  professionalId: { type: 'string', example: 'pro-1' },
                  serviceId: { type: 'string', example: 'serv-101' },
                  date: { type: 'string', format: 'date', example: '2026-10-15' },
                  time: { type: 'string', example: '10:00' },
                  clientName: { type: 'string', example: 'Carlos Eduardo' },
                  clientPhone: { type: 'string', example: '(11) 98765-4321' },
                  clientEmail: { type: 'string', format: 'email', example: 'carlos@email.com' },
                  notes: { type: 'string', example: 'Primeira vez no estabelecimento' },
                  paymentMethod: { type: 'string', example: 'pix' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Agendamento registrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' }
              }
            }
          },
          400: { description: 'Horário indisponível ou dados incompletos' }
        }
      }
    },
    '/api/bookings/client': {
      get: {
        tags: ['Agendamentos'],
        summary: 'Consulta os agendamentos de um cliente por e-mail ou telefone',
        parameters: [
          { name: 'phone', in: 'query', description: 'Telefone do cliente', schema: { type: 'string' } },
          { name: 'email', in: 'query', description: 'E-mail do cliente', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Lista de agendamentos do cliente',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Booking' }
                }
              }
            }
          }
        }
      }
    },
    '/api/bookings/{id}/status': {
      patch: {
        tags: ['Agendamentos'],
        summary: 'Atualiza o status de um agendamento',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
                    example: 'confirmed'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status atualizado com sucesso' },
          404: { description: 'Agendamento não encontrado' }
        }
      }
    },
    '/api/upload': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload de foto individual (Multipart/form-data)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary', description: 'Arquivo de imagem (JPG, PNG, WEBP até 10MB)' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Foto salva com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    url: { type: 'string', example: 'http://localhost:5000/uploads/img-123456.jpg' },
                    filename: { type: 'string', example: 'img-123456.jpg' },
                    size: { type: 'number', example: 1048576 }
                  }
                }
              }
            }
          },
          400: { description: 'Nenhum arquivo enviado ou formato incompatível' }
        }
      }
    },
    '/api/upload/registration-photos': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload simultâneo de fotos de cadastro (Avatar e Capa)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  avatar: { type: 'string', format: 'binary' },
                  coverImage: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Fotos enviadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    avatarUrl: { type: 'string', example: 'http://localhost:5000/uploads/avatar.jpg' },
                    coverImageUrl: { type: 'string', example: 'http://localhost:5000/uploads/cover.jpg' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/login': {
      post: {
        tags: ['Administração'],
        summary: 'Autenticação no painel master administrativo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', format: 'password', example: 'admin123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login administrativo aprovado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    admin: { type: 'object' }
                  }
                }
              }
            }
          },
          401: { description: 'Credenciais de administrador incorretas' }
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Administração'],
        summary: 'Lista todos os usuários (Profissionais e Clientes)',
        responses: {
          200: {
            description: 'Lista completa de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    professionals: { type: 'array', items: { $ref: '#/components/schemas/Professional' } },
                    clients: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/users/create': {
      post: {
        tags: ['Administração'],
        summary: 'Criação direta de usuário pelo administrador',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'role', 'password'],
                properties: {
                  name: { type: 'string', example: 'Novo Usuário' },
                  email: { type: 'string', example: 'novo@email.com' },
                  role: { type: 'string', enum: ['professional', 'client', 'admin'], example: 'professional' },
                  password: { type: 'string', example: 'senhaForte123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuário criado com sucesso' }
        }
      }
    },
    '/api/admin/professionals/{id}': {
      put: {
        tags: ['Administração'],
        summary: 'Atualização administrativa de dados do profissional',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Professional' }
            }
          }
        },
        responses: {
          200: { description: 'Profissional atualizado' }
        }
      },
      delete: {
        tags: ['Administração'],
        summary: 'Exclusão definitiva de um profissional',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Profissional removido com sucesso' }
        }
      }
    },
    '/api/admin/professionals/{id}/payment-methods': {
      put: {
        tags: ['Administração'],
        summary: 'Atualiza métodos e dados de pagamento do profissional (Chave Pix, Cartão, Dinheiro)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pix: { type: 'boolean', example: true },
                  pixKey: { type: 'string', example: '12.345.678/0001-90' },
                  card: { type: 'boolean', example: true },
                  cash: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Formas de pagamento atualizadas' }
        }
      }
    },
    '/api/admin/clients/{id}': {
      put: {
        tags: ['Administração'],
        summary: 'Atualiza dados de um cliente pelo admin',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Cliente Modificado' },
                  email: { type: 'string', example: 'cliente@email.com' },
                  phone: { type: 'string', example: '(11) 98888-7777' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Cliente atualizado' }
        }
      },
      delete: {
        tags: ['Administração'],
        summary: 'Remove um cliente pelo ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Cliente excluído com sucesso' }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-10' },
          name: { type: 'string', example: 'Lucas Oliveira' },
          email: { type: 'string', format: 'email', example: 'lucas@email.com' },
          role: { type: 'string', enum: ['professional', 'client', 'admin'], example: 'professional' },
          phone: { type: 'string', example: '(11) 98765-4321' },
          avatar: { type: 'string', example: 'http://localhost:5000/uploads/avatar.jpg' }
        }
      },
      Professional: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'pro-1' },
          name: { type: 'string', example: 'Barbearia Vintage' },
          specialty: { type: 'string', example: 'Cortes Clássicos e Barba' },
          avatar: { type: 'string', example: 'http://localhost:5000/uploads/avatar.jpg' },
          coverImage: { type: 'string', example: 'http://localhost:5000/uploads/cover.jpg' },
          bio: { type: 'string', example: 'Especialista em visagismo e barboterapia.' },
          address: { type: 'string', example: 'Rua das Flores, 123 - Centro' },
          phone: { type: 'string', example: '(11) 97777-6666' },
          services: {
            type: 'array',
            items: { $ref: '#/components/schemas/Service' }
          },
          rating: { type: 'number', example: 4.9 }
        }
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'serv-1' },
          name: { type: 'string', example: 'Corte Degradê + Barba' },
          price: { type: 'number', example: 65.0 },
          duration: { type: 'number', description: 'Duração em minutos', example: 45 },
          description: { type: 'string', example: 'Corte completo com navalha e toalha quente' }
        }
      },
      ServiceInput: {
        type: 'object',
        required: ['name', 'price', 'duration'],
        properties: {
          name: { type: 'string', example: 'Corte Social' },
          price: { type: 'number', example: 45.0 },
          duration: { type: 'number', example: 30 },
          description: { type: 'string', example: 'Corte padrão na tesoura ou máquina' }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'book-550' },
          professionalId: { type: 'string', example: 'pro-1' },
          serviceId: { type: 'string', example: 'serv-1' },
          date: { type: 'string', format: 'date', example: '2026-10-20' },
          time: { type: 'string', example: '15:30' },
          clientName: { type: 'string', example: 'Rodrigo Faro' },
          clientPhone: { type: 'string', example: '(11) 91111-2222' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'], example: 'confirmed' },
          price: { type: 'number', example: 65.0 },
          serviceName: { type: 'string', example: 'Corte Degradê + Barba' }
        }
      },
      RegisterProfessionalInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'specialty'],
        properties: {
          name: { type: 'string', example: 'Barbearia Vintage' },
          email: { type: 'string', format: 'email', example: 'contato@vintage.com' },
          password: { type: 'string', format: 'password', example: 'senha123' },
          specialty: { type: 'string', example: 'Barbearia e Estética Masculina' },
          phone: { type: 'string', example: '(11) 98888-7777' },
          address: { type: 'string', example: 'Av. Paulista, 1000' },
          bio: { type: 'string', example: 'Mais de 10 anos de experiência.' }
        }
      }
    }
  }
};

export const swaggerOptions = {
  customSiteTitle: 'AgendaMix API Documentation',
  customCss: '.swagger-ui .topbar { display: flex; background-color: #1a1a2e; } .swagger-ui .topbar .topbar-wrapper img { content: url("https://lucasdoeni.github.io/agendamix/logo.png"); height: 40px; }',
  customfavIcon: 'https://lucasdoeni.github.io/agendamix/favicon.ico'
};

export { swaggerUi };
