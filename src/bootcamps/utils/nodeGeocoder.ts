import * as NodeGeocoder from 'node-geocoder';

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const options: NodeGeocoder.Options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
  timeout: 4000,
};

const geocoder = NodeGeocoder(options);

export { geocoder };
