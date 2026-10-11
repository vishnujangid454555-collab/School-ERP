import { COLLECTIONS } from '../constants/collections.js';
import { resourceRoutes } from './resource.routes.js';

export const CORE_RESOURCES = [
  { key: 'admission-enquiries', collection: COLLECTIONS.ADMISSION_ENQUIRIES },
  { key: 'students', collection: COLLECTIONS.STUDENTS },
  { key: 'classes', collection: COLLECTIONS.CLASSES },
  { key: 'sections', collection: COLLECTIONS.SECTIONS },
  { key: 'subjects', collection: COLLECTIONS.SUBJECTS },
  { key: 'staff', collection: COLLECTIONS.STAFF },
];

export function registerResourceRoutes(router) {
  CORE_RESOURCES.forEach((resource) => router.use(`/${resource.key}`, resourceRoutes(resource)));
}
