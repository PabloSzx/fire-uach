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
};

const TagFragment = gql`
  fragment TagFragment on Tag {
    _id
    name
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
  username: string;
  admin: boolean;
  types: UserType[];
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
      uploadedAt: string;
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
  readTips: {
    _id: string;
    text: string;
    priority: number;
  }[];
};

const UserFragment = gql`
  fragment UserFragment on User {
    _id
    email
    username
    admin
    types
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
        uploadedAt
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
    readTips {
      _id
      text
      priority
    }
  }
`;

export const ALL_USERS: DocumentNode<
  {
    allUsers: {
      nodes: IUser[];
      pageInfo: {
        totalPages: number;
      };
    };
  },
  {
    pagination: { limit: number; after: number };
  }
> = gql`
  query($pagination: PaginationArg!) {
    allUsers(pagination: $pagination) {
      nodes {
        ...UserFragment
      }
      pageInfo {
        totalPages
      }
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
      username: string;
      admin: boolean;
      types: UserType[];
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
        uploadedAt: string;
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
        uploadedAt
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

export type ITip = {
  _id: string;
  text: string;
  priority: number;
};

const TipFragment = gql`
  fragment TipFragment on Tip {
    _id
    text
    priority
  }
`;

export const ALL_TIPS: DocumentNode<{
  allTips: ITip[];
}> = gql`
  query {
    allTips {
      ...TipFragment
    }
  }
  ${TipFragment}
`;

export const CREATE_TIP: DocumentNode<
  {
    createTip: ITip[];
  },
  {
    data: {
      text: string;
    };
  }
> = gql`
  mutation($data: CreateTip!) {
    createTip(data: $data) {
      ...TipFragment
    }
  }
  ${TipFragment}
`;

export const REMOVE_TIP: DocumentNode<
  {
    removeTip: ITip[];
  },
  {
    _id: string;
  }
> = gql`
  mutation($_id: ObjectId!) {
    removeTip(_id: $_id) {
      ...TipFragment
    }
  }
  ${TipFragment}
`;

export const EDIT_TIP: DocumentNode<
  {
    editTip: ITip[];
  },
  {
    data: {
      _id: string;
      text: string;
      priority: number;
    };
  }
> = gql`
  mutation($data: EditTip!) {
    editTip(data: $data) {
      ...TipFragment
    }
  }
  ${TipFragment}
`;
type IdateRange = { minDate: Date; maxDate: Date };

export const CSV_RESULTS_TAG_CATEGORIES: DocumentNode<
  {
    csvResultsTagCategoryAssociations: string;
  },
  {
    dateRange: IdateRange;
  }
> = gql`
  mutation($dateRange: DateRange!) {
    csvResultsTagCategoryAssociations(dateRange: $dateRange)
  }
`;

export const CSV_RESULTS_CATEGORY_IMAGE: DocumentNode<
  {
    csvResultsCategoryImageAssociations: string;
  },
  {
    onlyValidatedImages: boolean;
    date: IdateRange;
  }
> = gql`
  mutation($onlyValidatedImages: Boolean!, $dateRange: DateRange!) {
    csvResultsCategoryImageAssociations(
      onlyValidatedImages: $onlyValidatedImages
      dateRange: $dateRange
    )
  }
`;

export const USER_STATS: DocumentNode<
  {
    userStats?: {
      _id: string;
      nAssociatedImages: number;
      nAssociatedTags: number;
      nUploadedImages: number;
      nValidatedUploadedImages: number;
    };
  },
  {
    _id: string;
  }
> = gql`
  query($_id: ObjectId!) {
    userStats(user_id: $_id) {
      _id
      nAssociatedImages
      nAssociatedTags
      nUploadedImages
      nValidatedUploadedImages
    }
  }
`;

export const GENERAL_USER_PROGRESS: DocumentNode<{
  generalUserProgress: string[];
}> = gql`
  query {
    generalUserProgress
  }
`;
