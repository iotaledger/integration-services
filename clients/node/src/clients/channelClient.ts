import { ClientConfig } from '../models/clientConfig';
import { Base } from './base';

export class ChannelClient extends Base {
  constructor(config: ClientConfig) {
    super(config);
  }
}
