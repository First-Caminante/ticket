(() => {
  'use strict';

  const WA = '59177398405';

  const FULL_SITES = {
    editorial: {
      brand: 'Clínica Dental Aura',
      navLinks: [
        { label: 'Tratamientos', href: '#aura-tratamientos' },
        { label: 'Conócenos', href: '#editorial-conocenos' },
        { label: 'Opiniones', href: '#editorial-opiniones' },
        { label: 'Preguntas', href: '#editorial-faq' }
      ],
      about: {
        kicker: 'Conócenos · Nuestro Consultorio',
        title: 'Odontología estética sin apuros en el corazón de Calacoto.',
        text: 'Fundamos Aura en 2019 con una premisa simple: eliminar la ansiedad de ir al dentista. Trabajamos con agenda uno a uno, escáner intraoral digital y laboratorio cerámico propio para resultados naturales.',
        img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
        imgAlt: 'Equipo de odontología estética Clínica Dental Aura',
        stats: [
          ['+420', 'Sonrisas diseñadas'],
          ['6 años', 'En Calacoto, La Paz'],
          ['100%', 'Diagnóstico digital 3D']
        ]
      },
      reviews: [
        { quote: '“Me mostraron la simulación en pantalla antes de empezar y las carillas quedaron súper naturales. Puntualidad impecable.”', name: 'Valeria Mendoza', zone: 'San Miguel, La Paz' },
        { quote: '“El blanqueamiento no me dejó sensibilidad y el consultorio parece un spa. Totalmente recomendado.”', name: 'Rodrigo Paredes', zone: 'Obrajes, La Paz' },
        { quote: '“Llevo 5 meses con alineadores invisibles y el seguimiento mensual es rapidísimo y claro.”', name: 'Camila Flores', zone: 'Calacoto, La Paz' }
      ],
      faqs: [
        ['¿Cuánto dura la valoración inicial y qué incluye?', 'Dura 35 minutos e incluye escaneo fotográfico, revisión clínica y presupuesto exacto en bolivianos sin compromiso.'],
        ['¿Puedo pagar mi tratamiento en cuotas?', 'Sí. Para alineadores y carillas contamos con planes fraccionados en Bs mediante QR Simple o efectivo.'],
        ['¿Tienen estacionamiento cerca del consultorio?', 'Sí, estamos en Calle 21 de Calacoto con parqueo privado para pacientes en el mismo edificio.']
      ],
      cta: {
        title: 'Da el primer paso hacia una sonrisa natural',
        sub: 'Calle 21 de Calacoto, Edif. Aura Piso 2 · Lun–Vie 09:00–19:30 · Sáb 09:00–13:30',
        btn: 'Agendar valoración por WhatsApp',
        waText: 'Hola Clínica Dental Aura, quiero agendar una valoración en Calacoto.'
      }
    },
    bento: {
      brand: 'Nexo Seguridad & Domótica',
      navLinks: [
        { label: 'Soluciones', href: '#nexo-inicio' },
        { label: 'Cotizador Bs', href: '#nexo-cotizador' },
        { label: 'Nuestra Empresa', href: '#bento-conocenos' },
        { label: 'Preguntas', href: '#bento-faq' }
      ],
      about: {
        kicker: 'Conócenos · Ingeniería Local',
        title: 'Técnicos propios en La Paz, cero subcontrataciones.',
        text: 'En Nexo diseñamos e instalamos seguridad electrónica prolija: sin cables colgando, con respaldo eléctrico ante cortes y capacitación directa para toda tu familia o personal de tienda.',
        img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Ingeniero configurando sistema de domótica Nexo',
        stats: [
          ['+310', 'Instalaciones en LPZ'],
          ['24h', 'Tiempo de instalación'],
          ['2 años', 'Garantía escrita']
        ]
      },
      reviews: [
        { quote: '“Instalaron 4 cámaras en mi ferretería en un solo día. Veo todo nítido desde mi celular sin pagar mensualidades.”', name: 'Marco Antonio Ríos', zone: 'El Alto · Ceja' },
        { quote: '“La cerradura biométrica en mi departamento de Sopocachi fue la mejor inversión. Ya no cargo llaves.”', name: 'Andrea Quispe', zone: 'Sopocachi, La Paz' },
        { quote: '“Cuando cambié de wifi me ayudaron por WhatsApp en 5 minutos. Soporte real.”', name: 'Carlos Loayza', zone: 'Miraflores, La Paz' }
      ],
      faqs: [
        ['¿Debo pagar alguna mensualidad por usar la app?', 'No. El acceso desde iOS y Android es 100% gratuito de por vida; solo pagas el equipo y la instalación única en Bs.'],
        ['¿Qué pasa si se corta la luz o el internet?', 'Las cámaras siguen grabando en el disco local y con módulo UPS o alarma con batería sigues protegido ante cortes.'],
        ['¿Instalan en zonas alejadas o El Alto?', 'Sí, cubrimos toda la ciudad de La Paz, Zona Sur, Sopocachi, Miraflores y El Alto.']
      ],
      cta: {
        title: 'Protege tu hogar o negocio esta misma semana',
        sub: 'Oficina técnica en Sopocachi · Visitas de evaluación en La Paz y El Alto · Lun–Sáb 08:30–19:00',
        btn: 'Solicitar visita técnica por WhatsApp',
        waText: 'Hola Nexo Seguridad, quiero solicitar una cotización o visita técnica en La Paz.'
      }
    },
    kinetic: {
      brand: 'Kora Fitness Studio',
      navLinks: [
        { label: 'Horarios', href: '#kora-inicio' },
        { label: 'Planes Bs', href: '#kora-inicio' },
        { label: 'El Studio', href: '#kinetic-conocenos' },
        { label: 'Preguntas', href: '#kinetic-faq' }
      ],
      about: {
        kicker: 'Conócenos · El Studio en Sopocachi',
        title: 'No somos un gimnasio masivo. Somos tu hora favorita del día.',
        text: 'En Kora limitamos cada clase a 12 personas para que tu coach corrija tu postura, adapte cargas a tu nivel y te empuje a ver resultados reales desde el primer mes.',
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Entrenamiento guiado en Kora Fitness Studio Sopocachi',
        stats: [
          ['Máx. 12', 'Personas por clase'],
          ['50 min', 'Sesiones efectivas'],
          ['Bs 0', 'Matrícula de ingreso']
        ]
      },
      reviews: [
        { quote: '“Nunca había durado más de un mes en un gym hasta que probé Kora. La energía del grupo de las 19:30 es increíble.”', name: 'Lucía Vargas', zone: 'Sopocachi, La Paz' },
        { quote: '“Combinar Pilates Reformer con funcional me quitó el dolor de espalda por trabajar sentado todo el día.”', name: 'Diego Aramayo', zone: 'San Jorge, La Paz' },
        { quote: '“Cero máquinas ocupadas ni esperas. Llegas, entrenas fuerte 50 minutos y sales renovado.”', name: 'Sofía Terán', zone: 'Obrajes, La Paz' }
      ],
      faqs: [
        ['¿Necesito tener experiencia previa para empezar?', 'Para nada. Cada ejercicio tiene progresiones para principiantes e intermedios guiadas por el coach.'],
        ['¿Cómo reservo mi clase de prueba?', 'Nos escribes por WhatsApp, eliges tu horario (07:00 a 19:30) y te apartamos tu cupo al instante.'],
        ['¿Tienen duchas y lockers en el studio?', 'Sí, contamos con vestidores equipados, duchas con agua caliente y lockers individuales.']
      ],
      cta: {
        title: 'Prueba tu primera clase en Sopocachi esta semana',
        sub: 'Av. 20 de Octubre #2340, Sopocachi · Lun–Vie 06:30–21:00 · Sáb 08:00–13:00',
        btn: 'Reservar clase de prueba por WhatsApp',
        waText: 'Hola Kora Fitness Studio, quiero reservar mi clase de prueba en Sopocachi.'
      }
    },
    ropa: {
      brand: 'Atelier Altura',
      navLinks: [
        { label: 'Drop 04', href: '#ropa-drop' },
        { label: 'Nuestra Tienda', href: '#ropa-conocenos' },
        { label: 'Opiniones', href: '#ropa-opiniones' },
        { label: 'Envíos & Tallas', href: '#ropa-faq' }
      ],
      about: {
        kicker: 'Conócenos · Nuestra Tienda & Confección',
        title: 'Diseño independiente paceño con telas de alto gramaje.',
        text: 'Cada colección de Atelier Altura se produce en lotes numerados de 35 a 60 unidades. Seleccionamos algodón frizado de 420g y cortes boxy modernos que mantienen su forma lavado tras lavado.',
        img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Showroom de ropa urbana Atelier Altura',
        stats: [
          ['420g', 'Algodón pesado real'],
          ['2 horas', 'Envío en La Paz'],
          ['48h', 'Cambio de talla gratis']
        ]
      },
      reviews: [
        { quote: '“El hoodie es gruesísimo, perfecto para el frío de la noche en La Paz. Me lo entregaron en la estación Amarilla en 1 hora.”', name: 'Mateo Siles', zone: 'Sopocachi, La Paz' },
        { quote: '“Pedí talla M y quise cambiar a L; me hicieron el cambio al día siguiente sin drama.”', name: 'Fernanda Cruz', zone: 'Calacoto, La Paz' },
        { quote: '“La caída de la polera boxy es igual a marcas importadas pero a precio justo en bolivianos.”', name: 'Gabriel Nina', zone: 'Miraflores, La Paz' }
      ],
      faqs: [
        ['¿Cómo sé cuál es mi talla exacta?', 'Al escribirnos por WhatsApp te enviamos la tabla en centímetros y te recomendamos tu talla según tu estatura y peso.'],
        ['¿Hacen entregas en estaciones de Mi Teleférico?', 'Sí, entregamos sin recargo en estaciones Amarilla, Verde, Roja y Blanca, o a domicilio en toda La Paz.'],
        ['¿Envían a otros departamentos de Bolivia?', 'Sí, despachamos a diario por flota o courier a Santa Cruz, Cochabamba, Tarija, Sucre y Oruro.']
      ],
      cta: {
        title: 'Visita nuestro showroom o pide directo a tu puerta',
        sub: 'Showroom Sopocachi · Calle Belisario Salinas #480 · Mar–Sáb 10:30–19:30',
        btn: 'Consultar stock y tallas por WhatsApp',
        waText: 'Hola Atelier Altura, quiero consultar tallas disponibles del Drop 04.'
      }
    },
    tenis: {
      brand: 'Kinetic Kicks LPZ',
      navLinks: [
        { label: 'Modelos', href: '#tenis-inicio' },
        { label: 'Nuestra Tienda', href: '#tenis-conocenos' },
        { label: 'Clientes', href: '#tenis-opiniones' },
        { label: 'Garantía', href: '#tenis-faq' }
      ],
      about: {
        kicker: 'Conócenos · Tienda Física en San Miguel',
        title: 'Tu par favorito en stock real, sin esperar 3 semanas por pedido.',
        text: 'En Kinetic Kicks verificamos cada par antes de exhibirlo. Si dudas entre dos números, nuestro mensajero te lleva ambas tallas en La Paz para que te pruebes tranquilo antes de pagar.',
        img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Exhibición de sneakers en tienda Kinetic Kicks LPZ',
        stats: [
          ['+850', 'Pares entregados LPZ'],
          ['2 tallas', 'Prueba a domicilio'],
          ['100%', 'Pago contra entrega']
        ]
      },
      reviews: [
        { quote: '“Me trajeron 41 y 42 a mi oficina en El Prado para probarme. Me quedé con los Apex Runner, súper livianos.”', name: 'Sebastián Torrez', zone: 'El Prado, La Paz' },
        { quote: '“Compré los Trail Illimani para caminar por Mallasa y el agarre es brutal. Caja impecable.”', name: 'Alejandro Chuquimia', zone: 'Obrajes, La Paz' },
        { quote: '“Atención rápida por WhatsApp y pago con QR al recibir. Volveré por otro par.”', name: 'Daniela Alarcón', zone: 'San Miguel, La Paz' }
      ],
      faqs: [
        ['¿Puedo probarme antes de pagar?', 'Sí. En La Paz puedes visitarnos en San Miguel o pedir envío con 2 tallas para elegir el calce exacto al recibir.'],
        ['¿Los pares vienen en caja original?', 'Sí, todos los modelos se entregan nuevos en caja con etiqueta de talla EU/US verificable.'],
        ['¿Aceptan QR Simple y transferencias?', 'Sí, aceptamos QR Simple, transferencia bancaria y efectivo en bolivianos.']
      ],
      cta: {
        title: 'Aparta tu par antes de que se agote tu talla',
        sub: 'Tienda San Miguel · Galería Sur Local 14 · Lun–Sáb 10:00–20:00',
        btn: 'Escribir a Kinetic Kicks por WhatsApp',
        waText: 'Hola Kinetic Kicks LPZ, quiero consultar tallas disponibles hoy.'
      }
    },
    veterinario: {
      brand: 'VitalPet Clínica Veterinaria',
      navLinks: [
        { label: 'Servicios', href: '#vet-inicio' },
        { label: 'La Clínica', href: '#veterinario-conocenos' },
        { label: 'Tutores', href: '#veterinario-opiniones' },
        { label: 'Preguntas', href: '#veterinario-faq' }
      ],
      about: {
        kicker: 'Conócenos · Medicina Veterinaria con Empatía',
        title: 'Un equipo dedicado a que tu mascota entre moviendo la cola.',
        text: 'En VitalPet diseñamos áreas separadas para perros y gatos, usamos técnicas de manejo sin estrés y te entregamos el historial digital de vacunas para que nunca olvides un refuerzo.',
        img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Perro feliz en consulta VitalPet Clínica Veterinaria',
        stats: [
          ['+1.200', 'Mascotas atendidas'],
          ['24/7', 'Guardia de urgencias'],
          ['20 min', 'Resultados de lab']
        ]
      },
      reviews: [
        { quote: '“Mi gata siempre se estresaba en otras veterinarias, pero en la sala felina de VitalPet estuvo súper tranquila.”', name: 'Mariana Salvatierra', zone: 'San Miguel, La Paz' },
        { quote: '“Nos atendieron una urgencia a las 11 de la noche con una paciencia y profesionalismo admirables.”', name: 'Jorge Luis Mamani', zone: 'Calacoto, La Paz' },
        { quote: '“El carnet digital de vacunas y el recordatorio por WhatsApp me salvan la vida.”', name: 'Paola Gutiérrez', zone: 'Achumani, La Paz' }
      ],
      faqs: [
        ['¿Necesito cita previa o atienden por orden de llegada?', 'Para consultas y baño recomendamos agendar por WhatsApp para cero esperas; urgencias pasan de inmediato.'],
        ['¿Qué vacunas incluye el Plan Cachorro?', 'Incluye desparasitación interna, vacuna polivalente, control de crecimiento y registro en carnet digital.'],
        ['¿Tienen servicio de peluquería para razas grandes?', 'Sí, contamos con bañeras amplias, agua temperada y secadores de bajo ruido para todas las razas.']
      ],
      cta: {
        title: 'Agenda el control o baño de tu mascota hoy',
        sub: 'Calle Montenegro #1420, San Miguel · Lun–Dom 08:30–20:00 · Urgencias 24h',
        btn: 'Escribir a VitalPet por WhatsApp',
        waText: 'Hola VitalPet, quiero agendar una cita para mi mascota.'
      }
    },
    comida: {
      brand: 'Brasa & Humo',
      navLinks: [
        { label: 'Combos', href: '#comida-menu' },
        { label: 'Nuestra Cocina', href: '#comida-conocenos' },
        { label: 'Reseñas', href: '#comida-opiniones' },
        { label: 'Delivery', href: '#comida-faq' }
      ],
      about: {
        kicker: 'Conócenos · Cocina al Carbón',
        title: 'Carne fresca molida cada mañana, nunca congelada.',
        text: 'En Brasa & Humo sellamos cada smash burger a alta temperatura para lograr bordes crocantes y centro jugoso, acompañada de pan brioche horneado a diario y salsas caseras.',
        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Ambiente y cocina de Brasa y Humo en La Paz',
        stats: [
          ['18 min', 'Tiempo promedio'],
          ['100%', 'Carne fresca del día'],
          ['-20%', 'Pidiendo directo']
        ]
      },
      reviews: [
        { quote: '“La Doble Smash llega caliente y crocante de verdad. Pedir por WhatsApp sale mucho más barato que en las apps.”', name: 'Nicolás Herrera', zone: 'Sopocachi, La Paz' },
        { quote: '“Las costillas BBQ se deshacen solas. El Combo para 2 alcanza perfecto y sobra papa.”', name: 'Carla Peñaranda', zone: 'Miraflores, La Paz' },
        { quote: '“Excelente opción para pedir en la oficina al mediodía, siempre llegan puntualísimos.”', name: 'Esteban Roca', zone: 'San Jorge, La Paz' }
      ],
      faqs: [
        ['¿Cuáles son las zonas de delivery directo?', 'Cubrimos Sopocachi, Miraflores, San Jorge, Centro, Obrajes y Zona Sur con tarifa plana en Bs.'],
        ['¿Cómo pago mi pedido?', 'Puedes pagar con QR Simple al confirmar tu pedido o en efectivo al repartidor.'],
        ['¿Tienen mesas para comer en el local?', 'Sí, te esperamos en nuestro local de Sopocachi con terraza y cocina a la vista.']
      ],
      cta: {
        title: '¿Hambre ahora? Tu smash sale caliente en minutos',
        sub: 'Calle Guachalla #510, Sopocachi · Lun–Dom 12:00–23:00',
        btn: 'Hacer mi pedido por WhatsApp',
        waText: 'Hola Brasa & Humo, quiero hacer un pedido ahora.'
      }
    },
    pasteleria: {
      brand: 'Maison Sucre',
      navLinks: [
        { label: 'Armar Torta', href: '#pastel-inicio' },
        { label: 'Nuestro Taller', href: '#pasteleria-conocenos' },
        { label: 'Opiniones', href: '#pasteleria-opiniones' },
        { label: 'Pedidos', href: '#pasteleria-faq' }
      ],
      about: {
        kicker: 'Conócenos · Obrador Artesanal en Calacoto',
        title: 'Sin premezclas ni cremas artificiales. Solo pastelería honesta.',
        text: 'Horneamos cada bizcocho el mismo día de entrega con mantequilla real, cacao boliviano y belga, y compotas caseras de fruta fresca. Cada torta se decora a mano según tu celebración.',
        img: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Vitrina y taller de Maison Sucre Pastelería',
        stats: [
          ['0%', 'Premezclas industriales'],
          ['24h', 'Pedidos personalizados'],
          ['+600', 'Celebraciones en LPZ']
        ]
      },
      reviews: [
        { quote: '“Pedimos la de Frutos Rojos de 20 porciones para el cumpleaños de mi mamá y todos preguntaron de dónde era.”', name: 'Adriana Velasco', zone: 'Calacoto, La Paz' },
        { quote: '“El dulzor es súper equilibrado, nada empalagoso. La placa de chocolate con dedicatoria fue un detalle hermoso.”', name: 'Mauricio Beltrán', zone: 'Irpavi, La Paz' },
        { quote: '“Llegó impecable en transporte refrigerado hasta Sopocachi. Puntualidad 10/10.”', name: 'Ximena Loza', zone: 'Sopocachi, La Paz' }
      ],
      faqs: [
        ['¿Con cuánta anticipación debo encargar una torta?', 'Con 24 horas de anticipación para sabores clásicos, o 48 horas si deseas decoración floral o temática especial.'],
        ['¿Tienen tortas listas para recoger el mismo día?', 'Sí, todos los días tenemos vitrina fresca en Calacoto desde las 10:00 AM. Escríbenos para ver disponibilidad.'],
        ['¿Cómo se confirma el encargo?', 'Con un adelanto del 50% por QR Simple y el saldo al recoger o recibir tu torta.']
      ],
      cta: {
        title: 'Reserva la torta para tu próxima celebración',
        sub: 'Calle 18 de Calacoto #7910 · Mar–Dom 10:00–19:30',
        btn: 'Encargar torta por WhatsApp',
        waText: 'Hola Maison Sucre, quiero consultar disponibilidad para encargar una torta.'
      }
    },
    electronica: {
      brand: 'Volt Store Bolivia',
      navLinks: [
        { label: 'Catálogo', href: '#elec-catalogo' },
        { label: 'Nuestra Tienda', href: '#electronica-conocenos' },
        { label: 'Compradores', href: '#electronica-opiniones' },
        { label: 'Garantía', href: '#electronica-faq' }
      ],
      about: {
        kicker: 'Conócenos · Tienda Física & Garantía Escrita',
        title: 'Compra tecnología sin riesgos: verificamos el número de serie contigo.',
        text: 'En Volt Store todos los equipos son nuevos en caja sellada. Al recoger en tienda o recibir en La Paz, abres el producto frente a nosotros y verificamos la garantía oficial antes de cerrar tu compra.',
        img: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=900&q=80',
        imgAlt: 'Mostrador de productos tecnológicos en Volt Store Bolivia',
        stats: [
          ['12 meses', 'Garantía escrita'],
          ['100%', 'Cajas selladas'],
          ['Hoy', 'Entrega en La Paz']
        ]
      },
      reviews: [
        { quote: '“Verifiqué el serial de mis AirPods Pro en la página oficial ahí mismo en la tienda de San Miguel. Cero dudas.”', name: 'Andrés Morales', zone: 'San Miguel, La Paz' },
        { quote: '“Compré un iPad para la universidad y me asesoraron con el lápiz y funda sin intentar venderme lo más caro.”', name: 'Belén Chávez', zone: 'Miraflores, La Paz' },
        { quote: '“Me entregaron el SSD de 1TB en 45 minutos en El Prado. Factura y garantía al día.”', name: 'Fernando Aramayo', zone: 'El Prado, La Paz' }
      ],
      faqs: [
        ['¿Cómo funciona la garantía escrita?', 'Entregamos nota de venta con número de serie y 12 meses de respaldo ante defectos de fábrica.'],
        ['¿Los precios están en bolivianos?', 'Sí, todos los precios publicados son en bolivianos (Bs) y aceptamos QR Simple o efectivo.'],
        ['¿Hacen envíos asegurados al interior?', 'Sí, enviamos a Santa Cruz y Cochabamba con empaque sellado y guía de seguimiento el mismo día.']
      ],
      cta: {
        title: '¿Buscas un modelo específico? Consultamos stock al instante',
        sub: 'Tienda El Prado (Edif. Alameda PB) & San Miguel · Lun–Sáb 09:30–19:30',
        btn: 'Consultar stock por WhatsApp',
        waText: 'Hola Volt Store Bolivia, quiero consultar stock y precio en Bs de un equipo.'
      }
    }
  };

  Object.entries(FULL_SITES).forEach(([key, cfg]) => {
    const view = document.getElementById(`view-${key}`);
    if (!view) return;

    // 1. Inject real navigation menu into header
    const navInner = view.querySelector('header > div');
    if (navInner && !navInner.querySelector('.lp-nav-links')) {
      const nav = document.createElement('nav');
      nav.className = 'lp-nav-links';
      nav.setAttribute('aria-label', `Menú de ${cfg.brand}`);
      nav.innerHTML = cfg.navLinks.map((l) => `<a class="lp-nav-link" href="${l.href}">${l.label}</a>`).join('');
      if (navInner.children.length >= 2) {
        navInner.insertBefore(nav, navInner.children[1]);
      } else {
        navInner.appendChild(nav);
      }
    }

    // 2. Append Conócenos, Opiniones, FAQ & Final CTA Band inside <main>
    const main = view.querySelector('main');
    if (main) {
      const waHref = `https://wa.me/${WA}?text=${encodeURIComponent(cfg.cta.waText)}`;
      const extraHtml = `
        <section id="${key}-conocenos" class="lp-rich-sec">
          <div class="lp-wrap lp-about-grid" data-reveal>
            <div class="lp-photo lp-photo--wide">
              <img src="${cfg.about.img}" alt="${cfg.about.imgAlt}" loading="eager" decoding="async" referrerpolicy="no-referrer">
            </div>
            <div>
              <span class="lp-rich-kicker">${cfg.about.kicker}</span>
              <h2 class="lp-rich-h2" style="margin-block-start:0.5rem;">${cfg.about.title}</h2>
              <p class="lp-rich-sub" style="margin-block-start:0.875rem;">${cfg.about.text}</p>
              <div class="lp-about-stats tnum">
                ${cfg.about.stats.map(([val, lbl]) => `<div class="lp-about-stat"><strong>${val}</strong><span>${lbl}</span></div>`).join('')}
              </div>
            </div>
          </div>
        </section>

        <section id="${key}-opiniones" class="lp-rich-sec">
          <div class="lp-wrap">
            <div class="lp-rich-head" data-reveal>
              <span class="lp-rich-kicker">Clientes en La Paz</span>
              <h2 class="lp-rich-h2">Lo que dicen quienes ya nos eligieron</h2>
            </div>
            <div class="lp-reviews-grid">
              ${cfg.reviews.map((r) => `
                <article class="lp-review-card" data-reveal>
                  <p>${r.quote}</p>
                  <div class="lp-review-author"><strong>${r.name}</strong>${r.zone}</div>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <section id="${key}-faq" class="lp-rich-sec">
          <div class="lp-wrap">
            <div class="lp-rich-head" data-reveal>
              <span class="lp-rich-kicker">Preguntas Frecuentes</span>
              <h2 class="lp-rich-h2">Resolvemos tus dudas antes de pedir</h2>
            </div>
            <div class="lp-faq-list" data-reveal>
              ${cfg.faqs.map(([q, a], idx) => `
                <details class="lp-faq-item"${idx === 0 ? ' open' : ''}>
                  <summary>${q}</summary>
                  <p>${a}</p>
                </details>
              `).join('')}
            </div>
          </div>
        </section>

        <section id="${key}-contacto" class="lp-rich-sec">
          <div class="lp-wrap">
            <div class="lp-cta-box" data-reveal>
              <div>
                <h2 class="lp-rich-h2">${cfg.cta.title}</h2>
                <p class="lp-rich-sub" style="margin-block-start:0.5rem;">${cfg.cta.sub}</p>
              </div>
              <a href="${waHref}" class="lp-cta-btn" target="_blank" rel="noopener noreferrer">${cfg.cta.btn}</a>
            </div>
          </div>
        </section>
      `;
      main.insertAdjacentHTML('beforeend', extraHtml);
    }

    // 3. Upgrade footer to rich multi-column product footer
    const footer = view.querySelector('footer.lp-footer');
    if (footer) {
      footer.innerHTML = `
        <div class="lp-wrap">
          <div class="lp-footer-cols">
            <div class="lp-footer-col">
              <h3>${cfg.brand}</h3>
              <p>${cfg.about.title}</p>
              <p style="margin-block-start:0.5rem;">La Paz, Bolivia · Atención directa WhatsApp 77398405</p>
            </div>
            <div class="lp-footer-col">
              <h3>Navegación</h3>
              ${cfg.navLinks.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}
            </div>
            <div class="lp-footer-col">
              <h3>Ubicación &amp; Horarios</h3>
              <p>${cfg.cta.sub}</p>
              <a href="https://wa.me/${WA}?text=${encodeURIComponent(cfg.cta.waText)}" target="_blank" rel="noopener noreferrer" style="margin-block-start:0.375rem;font-weight:600;">WhatsApp +591 77398405 →</a>
            </div>
          </div>
          <div class="lp-footer__inner">
            <span>© ${new Date().getFullYear()} ${cfg.brand} · Sitio demo diseñado por etc</span>
            <div class="lp-footer__legal">
              <button type="button" class="lp-legal-btn" data-lp-legal="privacidad">Política de Privacidad</button>
              <button type="button" class="lp-legal-btn" data-lp-legal="terminos">Términos de Uso</button>
              <button type="button" class="lp-legal-btn" data-lp-legal="cookies">Aviso de Cookies</button>
            </div>
          </div>
        </div>
      `;
    }
  });

  // 4. Guarantee EVERY <img> across all 9 landings loads eagerly with no-referrer
  document.querySelectorAll('.landing-view img').forEach((img) => {
    img.loading = 'eager';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
  });
})();
