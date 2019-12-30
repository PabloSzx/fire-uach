import gql, { DocumentNode } from "graphql-tag-ts";

import { UserType } from "../../constants";

export type ICategories = {
  _id: string;
  name: string;
}[];

export const CategoryFragment = gql`
  fragment CategoryFragment on Category {
    _id
    name
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
    data: { _id: string; name: string };
  }
> = gql`
  mutation($data: EditCategory!) {
    editCategory(data: $data) {
      ...CategoryFragment
    }
  }
  ${CategoryFragment}
`;

export type ITag = {
  _id: string;
  name: string;
  categories: { _id: string; name: string }[];
};

const TagFragment = gql`
  fragment TagFragment on Tag {
    _id
    name
    categories {
      _id
      name
    }
  }
`;

export const TAGS: DocumentNode<{
  tags: ITag[];
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
    createTag: ITag[];
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
    removeTag: ITag[];
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
    editTag: ITag[];
  },
  {
    data: {
      _id: string;
      name: string;
      categories: string[];
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

export type IImage = {
  _id: string;
  filename: string;
  validated: boolean;
  uploader?: { _id: string; email: string };
  uploadedAt: string;
};

const ImageFragment = gql`
  fragment ImageFragment on Image {
    _id
    filename
    validated
    uploader {
      _id
      email
    }
    uploadedAt
  }
`;

export const IMAGES: DocumentNode<{
  images: IImage[];
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
    editImage: IImage[];
  },
  {
    data: {
      _id: string;
      validated: boolean;
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
    removeImage: IImage[];
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

export type IUser = {
  _id: string;
  email: string;
  admin: boolean;
  type?: UserType;
  typeSpecify: string;
  fireRelated: boolean;
  fireRelatedSpecify: string;
  locked: boolean;
  imagesUploaded: {
    _id: string;
    filename: string;
    uploadedAt: string;
  }[];
  tagCategoryAssociations: {
    _id: string;
    tag?: {
      _id: string;
      name: string;
    };
    categoryChosen?: {
      _id: string;
      name: string;
    };
    rejectedCategories: {
      _id: string;
      name: string;
    }[];
  }[];
  categoryImageAssociations: {
    _id: string;
    image?: {
      _id: string;
      filename: string;
    };
    categoryChosen?: {
      _id: string;
      name: string;
    };
    rejectedCategories: {
      _id: string;
      name: string;
    }[];
  }[];
};

const UserFragment = gql`
  fragment UserFragment on User {
    _id
    email
    admin
    type
    typeSpecify
    fireRelated
    fireRelatedSpecify
    locked
    imagesUploaded {
      _id
      filename
      uploadedAt
    }
    tagCategoryAssociations {
      _id
      tag {
        _id
        name
      }
      categoryChosen {
        _id
        name
      }
      rejectedCategories {
        _id
        name
      }
    }
    categoryImageAssociations {
      _id
      image {
        _id
        filename
      }
      categoryChosen {
        _id
        name
      }
      rejectedCategories {
        _id
        name
      }
    }
  }
`;

export const ALL_USERS: DocumentNode<{
  allUsers: IUser[];
}> = gql`
  query {
    allUsers {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const EDIT_USER: DocumentNode<
  {
    editUser: IUser[];
  },
  {
    data: {
      _id: string;
      admin: boolean;
      type?: UserType;
      typeSpecify: string;
      fireRelated: boolean;
      fireRelatedSpecify: string;
      locked: boolean;
    };
  }
> = gql`
  mutation($data: EditUser!) {
    editUser(data: $data) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const REMOVE_USER: DocumentNode<
  {
    removeUser: IUser[];
  },
  {
    id: string;
  }
> = gql`
  mutation($id: ObjectId!) {
    removeUser(id: $id) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const RESET_TAG_CATEGORY_ASSOCIATIONS: DocumentNode<
  {
    resetTagCategoryAssociations: {
      _id: string;
      tag?: {
        _id: string;
        name: string;
      };
      categoryChosen?: {
        _id: string;
        name: string;
      };
      rejectedCategories: {
        _id: string;
        name: string;
      }[];
    }[];
  },
  {
    user: string;
  }
> = gql`
  mutation($user: ObjectId!) {
    resetTagCategoryAssociations(user: $user) {
      _id
      tag {
        _id
        name
      }
      categoryChosen {
        _id
        name
      }
      rejectedCategories {
        _id
        name
      }
    }
  }
`;

export const RESET_CATEGORY_IMAGE_ASSOCIATIONS: DocumentNode<
  {
    resetCategoryImageAssociations: {
      _id: string;
      image?: {
        _id: string;
        filename: string;
      };
      categoryChosen?: {
        _id: string;
        name: string;
      };
      rejectedCategories: {
        _id: string;
        name: string;
      }[];
    }[];
  },
  {
    user: string;
  }
> = gql`
  mutation($user: ObjectId!) {
    resetCategoryImageAssociations(user: $user) {
      _id
      image {
        _id
        filename
      }
      categoryChosen {
        _id
        name
      }
      rejectedCategories {
        _id
        name
      }
    }
  }
`;
