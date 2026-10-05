export const CATEGORIES = [
  { id: 'barbearia', label: 'Barbearia', icon: 'Scissors', count: 12 },
  { id: 'cabeleireiro', label: 'Cabeleireiro', icon: 'Sparkles', count: 18 },
  { id: 'manicure', label: 'Manicure & Pedicure', icon: 'Hand', count: 15 },
  { id: 'estetica', label: 'Estética Facial & Corporal', icon: 'Heart', count: 9 },
  { id: 'sobrancelhas', label: 'Design de Sobrancelhas', icon: 'Eye', count: 14 }
];

export const INITIAL_PROFESSIONALS = [
  {
    id: 'pro-1',
    name: 'Carlos Albuquerque',
    commercialName: 'Barbearia Dom Carlos',
    category: 'barbearia',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    email: 'carlos@barbeariadomcarlos.com.br',
    phone: '(11) 98765-4321',
    city: 'São Paulo, SP',
    address: 'Rua Augusta, 1420 - Consolação',
    rating: 4.9,
    reviewCount: 128,
    bio: 'Mais de 10 anos de experiência em cortes clássicos e modernos, barba com toalha quente e cuidados masculinos premium.',
    featured: true,
    schedule: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Seg a Sáb
      startHour: '09:00',
      endHour: '19:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      slotInterval: 30 // minutos
    },
    blockedSlots: [
      { date: '2026-10-06', time: '15:00', reason: 'Manutenção de equipamentos' }
    ],
    services: [
      {
        id: 'srv-101',
        name: 'Corte Tradicional Masculino',
        price: 65.0,
        duration: 40,
        description: 'Corte na tesoura ou máquina, lavagem refrescante e finalização com pomada modeladora.'
      },
      {
        id: 'srv-102',
        name: 'Barboterapia com Toalha Quente',
        price: 55.0,
        duration: 35,
        description: 'Design de barba navalhado, esfoliação facial, hidratação profunda e massagem relaxante.'
      },
      {
        id: 'srv-103',
        name: 'Combo Cabelo + Barba',
        price: 110.0,
        duration: 70,
        description: 'Cuidado completo para o visual. Inclui corte, barba completa, toalha quente e alinhamento.'
      },
      {
        id: 'srv-104',
        name: 'Camuflagem de Fios Brancos',
        price: 80.0,
        duration: 30,
        description: 'Tonalização sutil e natural que disfarça cabelos e pelos grisalhos sem marcar.'
      }
    ]
  },
  {
    id: 'pro-2',
    name: 'Juliana Mendes',
    commercialName: 'Juliana Mendes Hair Studio',
    category: 'cabeleireiro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    email: 'contato@julianamendes.com.br',
    phone: '(11) 99123-8877',
    city: 'São Paulo, SP',
    address: 'Av. Brigadeiro Faria Lima, 2040 - Itaim Bibi',
    rating: 5.0,
    reviewCount: 94,
    bio: 'Colorista e visagista premiada internacionalmente. Especialista em mechas iluminadas, corte em camadas e tratamentos de alta performance.',
    featured: true,
    schedule: {
      daysOfWeek: [2, 3, 4, 5, 6], // Ter a Sáb
      startHour: '09:00',
      endHour: '19:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
      slotInterval: 30
    },
    blockedSlots: [],
    services: [
      {
        id: 'srv-201',
        name: 'Corte Visagista Feminino + Escova',
        price: 180.0,
        duration: 60,
        description: 'Consultoria de corte alinhada ao formato de rosto, lavagem especial e escova modelada.'
      },
      {
        id: 'srv-202',
        name: 'Morena Iluminada / Mechas Suaves',
        price: 450.0,
        duration: 180,
        description: 'Técnica de clareamento sem marcas, com preservação da saúde dos fios e tonalização personalizada.'
      },
      {
        id: 'srv-203',
        name: 'Nutrição Profunda & Reconstrução Molecular',
        price: 220.0,
        duration: 60,
        description: 'Tratamento intensivo para fios danificados por químicas e fontes térmicas.'
      }
    ]
  },
  {
    id: 'pro-3',
    name: 'Camila Rocha',
    commercialName: 'Studio Camila Rocha Nails & Spa',
    category: 'manicure',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    email: 'camila@rochanails.com',
    phone: '(11) 97722-1144',
    city: 'São Paulo, SP',
    address: 'Alameda dos Arapanés, 890 - Moema',
    rating: 4.85,
    reviewCount: 76,
    bio: 'Especialista em blindagem de unhas de gel, manicure russa e nail art minimalista com produtos hipoalergênicos e estufa autoclave hospitalar.',
    featured: true,
    schedule: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startHour: '08:30',
      endHour: '18:00',
      lunchStart: '12:30',
      lunchEnd: '13:30',
      slotInterval: 30
    },
    blockedSlots: [],
    services: [
      {
        id: 'srv-301',
        name: 'Manicure & Pedicure Completa',
        price: 85.0,
        duration: 60,
        description: 'Cutilagem delicada, esfoliação suave, hidratação profunda e esmaltação de longa duração.'
      },
      {
        id: 'srv-302',
        name: 'Alongamento em Fibra de Vidro',
        price: 190.0,
        duration: 120,
        description: 'Unhas naturais, finas e resistentes sob medida com manutenção recomendada a cada 25 dias.'
      },
      {
        id: 'srv-303',
        name: 'Spa dos Pés com Plástica Podal',
        price: 110.0,
        duration: 50,
        description: 'Remoção de calosidades e rachaduras, imersão em óleos essenciais e massagem relaxante.'
      }
    ]
  },
  {
    id: 'pro-4',
    name: 'Dra. Beatriz Fontana',
    commercialName: 'Beatriz Fontana Estética Avançada',
    category: 'estetica',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    email: 'contato@beatrizfontana.com.br',
    phone: '(11) 98833-2211',
    city: 'São Paulo, SP',
    address: 'Rua Bela Cintra, 1870 - Jardins',
    rating: 4.95,
    reviewCount: 110,
    bio: 'Fisioterapeuta dermatofuncional dedicada a protocolos faciais de rejuvenescimento, limpeza de pele ultrassônica e drenagem linfática Renata França.',
    featured: true,
    schedule: {
      daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
      startHour: '09:00',
      endHour: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      slotInterval: 30
    },
    blockedSlots: [],
    services: [
      {
        id: 'srv-401',
        name: 'Limpeza de Pele Profunda com Fototerapia',
        price: 180.0,
        duration: 75,
        description: 'Extração segura de cravos e impurezas, peeling de diamante, máscara calmante e LED revigorante.'
      },
      {
        id: 'srv-402',
        name: 'Drenagem Linfática Corporal',
        price: 150.0,
        duration: 60,
        description: 'Técnica manual estimulante para eliminação de toxinas, redução de inchaço e relaxamento muscular.'
      },
      {
        id: 'srv-403',
        name: 'Peeling Químico Renovador',
        price: 210.0,
        duration: 50,
        description: 'Ácidos seguros para clareamento de manchas solares e atenuação de linhas finas de expressão.'
      }
    ]
  },
  {
    id: 'pro-5',
    name: 'Larissa Becker',
    commercialName: 'Larissa Becker Brow & Lash Design',
    category: 'sobrancelhas',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    email: 'larissa@beckerbrows.com',
    phone: '(11) 96544-7788',
    city: 'São Paulo, SP',
    address: 'Rua Oscar Freire, 620 - Cerqueira César',
    rating: 4.92,
    reviewCount: 88,
    bio: 'Especialista em visagismo de olhar, micropigmentação shadow line hiper-realista, laminação de sobrancelhas (Brow Lamination) e Lash Lifting.',
    featured: true,
    schedule: {
      daysOfWeek: [2, 3, 4, 5, 6],
      startHour: '10:00',
      endHour: '19:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
      slotInterval: 30
    },
    blockedSlots: [],
    services: [
      {
        id: 'srv-501',
        name: 'Design Personalizado com Henna Premium',
        price: 75.0,
        duration: 45,
        description: 'Mapeamento facial simétrico, alinhamento com pinça e tintura natural para efeito preenchido.'
      },
      {
        id: 'srv-502',
        name: 'Brow Lamination + Hidratação com Botox',
        price: 160.0,
        duration: 60,
        description: 'Alinhamento dos fios rebeldes na direção ideal com fórmula nutritiva enriquecida com queratina.'
      },
      {
        id: 'srv-503',
        name: 'Lash Lifting com Coloração',
        price: 150.0,
        duration: 60,
        description: 'Curvatura duradoura e tingimento dos cílios naturais, dispensando o uso de rímel por até 8 semanas.'
      }
    ]
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'bkg-1001',
    proId: 'pro-1',
    proName: 'Carlos Albuquerque',
    commercialName: 'Barbearia Dom Carlos',
    serviceId: 'srv-101',
    serviceName: 'Corte Tradicional Masculino',
    price: 65.0,
    duration: 40,
    date: '2026-10-05',
    time: '10:00',
    clientName: 'Rodrigo Silva',
    clientEmail: 'rodrigo.silva@exemplo.com',
    clientPhone: '(11) 98111-2233',
    status: 'confirmed', // confirmed, pending, completed, cancelled
    createdAt: '2026-10-03T14:20:00Z'
  },
  {
    id: 'bkg-1002',
    proId: 'pro-1',
    proName: 'Carlos Albuquerque',
    commercialName: 'Barbearia Dom Carlos',
    serviceId: 'srv-103',
    serviceName: 'Combo Cabelo + Barba',
    price: 110.0,
    duration: 70,
    date: '2026-10-05',
    time: '14:00',
    clientName: 'Fernando Costa',
    clientEmail: 'fernando.costa@exemplo.com',
    clientPhone: '(11) 99888-7766',
    status: 'confirmed',
    createdAt: '2026-10-04T09:15:00Z'
  },
  {
    id: 'bkg-1003',
    proId: 'pro-2',
    proName: 'Juliana Mendes',
    commercialName: 'Juliana Mendes Hair Studio',
    serviceId: 'srv-201',
    serviceName: 'Corte Visagista Feminino + Escova',
    price: 180.0,
    duration: 60,
    date: '2026-10-06',
    time: '11:00',
    clientName: 'Mariana Duarte',
    clientEmail: 'mariana.duarte@exemplo.com',
    clientPhone: '(11) 97654-3210',
    status: 'confirmed',
    createdAt: '2026-10-02T11:00:00Z'
  }
];
