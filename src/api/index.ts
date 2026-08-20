import { USE_MOCK } from './client';
import * as mock from './mock/handlers';
import * as real from './real/handlers';

export const contentApi = USE_MOCK ? mock.contentApi : real.contentApi;
export { USE_MOCK };
