import { Action } from '../casl-ability.factory';
import { Subject } from '@casl/ability';
import { SetMetadata } from '@nestjs/common';

export interface RequiredRule {
  action: Action;
  subject: Subject;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
