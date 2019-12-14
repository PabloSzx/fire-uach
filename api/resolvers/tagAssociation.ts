import { FieldResolver, Resolver, Root } from "type-graphql";

import { isDocument } from "@typegoose/typegoose";

import { TagModel } from "../entities/tag";
import { TagAssociation } from "../entities/TagAssociation";

@Resolver(() => TagAssociation)
export class TagAssociationResolver {
  @FieldResolver()
  async tag1(@Root() { tag1 }: Partial<TagAssociation>) {
    if (tag1) {
      if (isDocument(tag1)) {
        return tag1;
      } else {
        return await TagModel.findById(tag1);
      }
    }
    return null;
  }

  @FieldResolver()
  async tag2(@Root() { tag2 }: Partial<TagAssociation>) {
    if (tag2) {
      if (isDocument(tag2)) {
        return tag2;
      } else {
        return await TagModel.findById(tag2);
      }
    }
    return null;
  }
}
