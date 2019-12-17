import gql, { DocumentNode } from "graphql-tag-ts";

export type ICategories = {
  _id: string;
  name: string;
  tags: { _id: string; name: string }[];
}[];

const CategoryFragment = gql`
  fragment CategoryFragment on Category {
    _id
    name
    tags {
      _id
      name
    }
  }
`;
export const CATEGORIES: DocumentNode<{
  categories: ICategories;
}> = gql`
  query {
    categories {
      ...CategoryFragment
    }
  }
  ${CategoryFragment}
`;

export const CREATE_CATEGORY: DocumentNode<
  {
    createCategory: ICategories;
  },
  {
    data: { name: string };
  }
> = gql`
  mutation($data: CreateCategory!) {
    createCategory(data: $data) {
      ...CategoryFragment
    }
  }
  ${CategoryFragment}
`;

export const REMOVE_CATEGORY: DocumentNode<
  {
    removeCategory: ICategories;
  },
  {
    data: { _id: string };
  }
> = gql`
  mutation($data: RemoveCategory!) {
    removeCategory(data: $data) {
      ...CategoryFragment
    }
  }
  ${CategoryFragment}
`;

export const EDIT_CATEGORY: DocumentNode<
  {
    editCategory: ICategories;
  },
  {
    data: { _id: string; name: string; tags: string[] };
  }
> = gql`
  mutation($data: EditCategory!) {
    editCategory(data: $data) {
      ...CategoryFragment
    }
  }
  ${CategoryFragment}
`;

export type ITags = {
  _id: string;
  name: string;
  possibleTagAssociations: { _id: string; name: string }[];
}[];

const TagFragment = gql`
  fragment TagFragment on Tag {
    _id
    name
    possibleTagAssociations {
      _id
      name
    }
  }
`;

export const TAGS: DocumentNode<{
  tags: ITags;
}> = gql`
  query {
    tags {
      ...TagFragment
    }
  }
  ${TagFragment}
`;

export const CREATE_TAG: DocumentNode<
  {
    createTag: ITags;
  },
  {
    data: {
      name: string;
    };
  }
> = gql`
  mutation($data: CreateTag!) {
    createTag(data: $data) {
      ...TagFragment
    }
  }
  ${TagFragment}
`;

export const REMOVE_TAG: DocumentNode<
  {
    removeTag: ITags;
  },
  {
    data: {
      _id: string;
    };
  }
> = gql`
  mutation($data: RemoveTag!) {
    removeTag(data: $data) {
      ...TagFragment
    }
  }
  ${TagFragment}
`;

export const EDIT_TAG: DocumentNode<
  {
    editTag: ITags;
  },
  {
    data: {
      _id: string;
      name: string;
      possibleTagAssociations: string[];
    };
  }
> = gql`
  mutation($data: EditTag!) {
    editTag(data: $data) {
      ...TagFragment
    }
  }
  ${TagFragment}
`;

export type IImages = {
  _id: string;
  filename: string;
  validated: boolean;
  categories: { _id: string; name: string }[];
}[];

const ImageFragment = gql`
  fragment ImageFragment on Image {
    _id
    filename
    validated
    categories {
      _id
      name
    }
  }
`;

export const IMAGES: DocumentNode<{
  images: IImages;
}> = gql`
  query {
    images {
      ...ImageFragment
    }
  }
  ${ImageFragment}
`;

export const EDIT_IMAGE: DocumentNode<
  {
    editImage: IImages;
  },
  {
    data: {
      _id: string;
      validated: boolean;
      categories: string[];
    };
  }
> = gql`
  mutation($data: EditImage!) {
    editImage(data: $data) {
      ...ImageFragment
    }
  }
  ${ImageFragment}
`;

export const REMOVE_IMAGE: DocumentNode<
  {
    removeImage: IImages;
  },
  {
    data: {
      _id: string;
    };
  }
> = gql`
  mutation($data: RemoveImage!) {
    removeImage(data: $data) {
      ...ImageFragment
    }
  }
  ${ImageFragment}
`;
