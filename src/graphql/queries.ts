import gql, { DocumentNode } from "graphql-tag-ts";

import { UserType } from "../../constants";

export type IUser = {
  _id: string;
  email: string;
  username: string;
  admin: boolean;
};

export const CurrentUserFragment = gql`
  fragment CurrentUserFragment on User {
    _id
    email
    username
    admin
  }
`;

export const CURRENT_USER: DocumentNode<{
  currentUser?: IUser;
}> = gql`
  query {
    currentUser {
      ...CurrentUserFragment
    }
  }
  ${CurrentUserFragment}
`;

export const LOGIN: DocumentNode<
  {
    login: IUser;
  },
  {
    data: {
      email: string;
      password: string;
    };
  }
> = gql`
  mutation($data: LoginInput!) {
    login(data: $data) {
      ...CurrentUserFragment
    }
  }
  ${CurrentUserFragment}
`;

export const SIGN_UP: DocumentNode<
  {
    signUp: IUser;
  },
  {
    data: {
      email: string;
      username: string;
      password: string;
      types: UserType[];
      typeSpecify: string;
      fireRelated: boolean;
      fireRelatedSpecify: string;
    };
  }
> = gql`
  mutation($data: SignUpInput!) {
    signUp(data: $data) {
      ...CurrentUserFragment
    }
  }
  ${CurrentUserFragment}
`;

export const FORGOT_PASSWORD: DocumentNode<
  {
    forgotPassword: boolean;
  },
  {
    email: string;
  }
> = gql`
  mutation($email: EmailAddress!) {
    forgotPassword(email: $email)
  }
`;

export const UNLOCK: DocumentNode<
  {
    unlock?: IUser;
  },
  {
    data: {
      email: string;
      password: string;
      unlockKey: string;
    };
  }
> = gql`
  mutation($data: UnlockInput!) {
    unlock(data: $data) {
      ...CurrentUserFragment
    }
  }
  ${CurrentUserFragment}
`;

export const OWN_IMAGES: DocumentNode<{
  ownImages: { _id: string; filename: string; uploadedAt: string }[];
}> = gql`
  query {
    ownImages {
      _id
      filename
      uploadedAt
    }
  }
`;

export const UPLOAD_IMAGE: DocumentNode<
  {
    uploadImage: {
      _id: string;
      filename: string;
      uploadedAt: string;
    }[];
  },
  {
    file: File;
  }
> = gql`
  mutation($file: Upload!) {
    uploadImage(file: $file) {
      _id
      filename
      uploadedAt
    }
  }
`;

export const VALIDATED_IMAGES: DocumentNode<{
  validatedImages: {
    _id: string;
    filename: string;
    uploadedAt: string;
  }[];
}> = gql`
  query {
    validatedImages {
      _id
      filename
      uploadedAt
    }
  }
`;

export const LOGOUT: DocumentNode = gql`
  mutation {
    logout
  }
`;

export const NOT_ANSWERED_IMAGE: DocumentNode<
  {
    notAnsweredImage?: {
      _id: string;
      filename: string;
    };
  },
  {
    onlyOwnImages?: boolean;
  }
> = gql`
  query($onlyOwnImages: Boolean) {
    notAnsweredImage(onlyOwnImages: $onlyOwnImages) {
      _id
      filename
    }
  }
`;

export const ANSWER_CATEGORY_IMAGE_ASSOCIATION: DocumentNode<
  {
    answerCategoryImageAssociation?: {
      _id: string;
      filename: string;
    };
  },
  {
    onlyOwnImages?: boolean;

    data: {
      image: string;
      categoryChosen?: string;
      rejectedCategories: string[];
      location?: { latitude: number; longitude: number };
      otherCategoryInput?: string;
    };
  }
> = gql`
  mutation($data: CategoryImageAssociationAnswer!, $onlyOwnImages: Boolean) {
    answerCategoryImageAssociation(data: $data, onlyOwnImages: $onlyOwnImages) {
      _id
      filename
    }
  }
`;

export const NOT_ANSWERED_TAG: DocumentNode<{
  notAnsweredTag?: {
    _id: string;
    name: string;
  };
}> = gql`
  query {
    notAnsweredTag {
      _id
      name
    }
  }
`;

export const ANSWER_TAG_CATEGORY_ASSOCIATION: DocumentNode<
  {
    answerTagCategoryAssociation?: {
      _id: string;
      name: string;
    };
  },
  {
    data: {
      tag: string;
      categoryChosen?: string;
      rejectedCategories: string[];
      location?: { latitude: number; longitude: number };
      otherCategoryInput?: string;
    };
  }
> = gql`
  mutation($data: TagCategoryAssociationAnswer!) {
    answerTagCategoryAssociation(data: $data) {
      _id
      name
    }
  }
`;

export const CATEGORIES_OPTIONS: DocumentNode<{
  categories: { _id: string; name: string }[];
}> = gql`
  query {
    categories {
      _id
      name
    }
  }
`;

export const TIP: DocumentNode<{
  tip?: {
    _id: string;
    text: string;
  };
}> = gql`
  mutation {
    tip {
      _id
      text
    }
  }
`;

export const OWN_STATS: DocumentNode<{
  ownStats: {
    _id: string;
    nAssociatedImages: number;
    nAssociatedTags: number;
    nUploadedImages: number;
    nValidatedUploadedImages: number;
    imagesLevel: number;
    tagsLevel: number;
    uploadLevel: number;
    overallLevel: number;
    score: number;
    rankingPosition: number;
  };
}> = gql`
  query {
    ownStats {
      _id
      nAssociatedImages
      nAssociatedTags
      nUploadedImages
      nValidatedUploadedImages
      imagesLevel
      tagsLevel
      uploadLevel
      overallLevel
      score
      rankingPosition
    }
  }
`;

export const RANKING_STATS: DocumentNode<
  {
    rankingStats: {
      _id: string;
      user?: {
        _id: string;
        username: string;
      };
      overallLevel: string;
    }[];
  },
  {
    limit?: number;
  }
> = gql`
  query($limit: Int) {
    rankingStats(limit: $limit) {
      _id
      user {
        _id
        username
      }
      overallLevel
    }
  }
`;
