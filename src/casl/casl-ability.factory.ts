import { RoleType, User } from '../users/entities/user.entity';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Bootcamp } from '../bootcamps/entities/bootcamp.entity';
import { Course } from '../courses/entities/course.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects =
  | InferSubjects<typeof User | typeof Bootcamp | typeof Course>
  | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === RoleType.ADMIN) {
      can(Action.Manage, 'all'); // read-write access to everything
    }

    if (user.role === RoleType.USER) {
      can(Action.Read, 'all');
    }

    if (user.role === RoleType.PUBLISHER) {
      cannot(Action.Read, 'all');
      // Can't create Bootcamp if user already made one. Can't make 2 bootcamps
      // type FlatBootcamp = Bootcamp & {
      //   'user.id': Bootcamp['user']['id'];
      // };
      // cannot<FlatBootcamp>(Action.Create, Bootcamp, { 'user.id': user.id });
    }

    // https://www.youtube.com/watch?v=1pPjCX0FHco
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
