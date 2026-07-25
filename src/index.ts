import type { Core } from '@strapi/strapi';

// Permisos públicos por defecto para que el frontend (Next.js) pueda
// leer el catálogo/procesos sin autenticación, y enviar el formulario
// de contacto sin exponer lectura de los mensajes recibidos.
const PUBLIC_READ = ['product', 'product-category', 'process-step', 'page', 'site-setting', 'faq-item'];
const READ_ACTIONS = ['find', 'findOne'];
const PUBLIC_CREATE_ONLY = ['contact-submission'];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    const actionsToEnable: string[] = [];

    for (const uid of PUBLIC_READ) {
      for (const action of READ_ACTIONS) {
        actionsToEnable.push(`api::${uid}.${uid}.${action}`);
      }
    }
    for (const uid of PUBLIC_CREATE_ONLY) {
      actionsToEnable.push(`api::${uid}.${uid}.create`);
    }

    for (const action of actionsToEnable) {
      const existing = await strapi.query('plugin::users-permissions.permission').findOne({
        where: { action, role: publicRole.id },
      });

      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action, role: publicRole.id },
        });
      }
    }
  },
};
