import gql, { DocumentNode } from "graphql-tag-ts";

import { UserType } from "../../constants";

export type IUser = {
  _id: string;
  email: string;
  admin: boolean;
  imagesUploaded: {
    _id: string;
    filename: string;
  }[];
};

export const CurrentUserFragment = gql`
  fragment CurrentUserFragment on User {
    _id
    email
    admin
    imagesUploaded {
      _id
      filename
    }
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
      password: string;
      type?: UserType;
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

export const OWN_IMAGES: DocumentNode<{
  ownImages: { _id: string; filename: string }[];
}> = gql`
  query {
    ownImages {
      _id
      filename
    }
  }
`;

export const UPLOAD_IMAGE: DocumentNode<
  {
    uploadImage: {
      _id: string;
      filename: string;
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
    }
  }
`;

export const VALIDATED_IMAGES: DocumentNode<{
  validatedImages: {
    _id: string;
    filename: string;
  }[];
}> = gql`
  query {
    validatedImages {
      _id
      filename
    }
  }
`;

export const LOGOUT: DocumentNode = gql`
  mutation {
    logout
  }
`;

export const NOT_ANSWERED_IMAGES: DocumentNode<
  {
    notAnsweredImages: {
      _id: string;
      filename: string;
    }[];
  },
  {
    onlyValidated: boolean;
  }
> = gql`
  query($onlyValidated: Boolean!) {
    notAnsweredImages(onlyValidated: $onlyValidated) {
      _id
      filename
    }
  }
`;

export const ANSWER_CATEGORY_IMAGE_ASSOCIATION: DocumentNode<
  {
    answerCategoryImageAssociation: {
      _id: string;
      filename: string;
    }[];
  },
  {
    onlyValidated: boolean;
    data: {
      image: string;
      category?: string;
      rejectedCategories: string[];
    };
  }
> = gql`
  mutation($onlyValidated: Boolean!, $data: CategoryImageAssociationAnswer!) {
    answerCategoryImageAssociation(data: $data, onlyValidated: $onlyValidated) {
      _id
      filename
    }
  }
`;

export const NOT_ANSWERED_TAGS: DocumentNode<{
  notAnsweredTags: {
    _id: string;
    name: string;
    categories: {
      _id: string;
      name: string;
    }[];
  }[];
}> = gql`
  query {
    notAnsweredTags {
      _id
      name
      categories {
        _id
        name
      }
    }
  }
`;

export const ANSWER_TAG_CATEGORY_ASSOCIATION: DocumentNode<
  {
    answerTagCategoryAssociation: {
      _id: string;
      name: string;
      categories: {
        _id: string;
        name: string;
      }[];
    }[];
  },
  {
    data: {
      tag: string;
      categoryChosen?: string;
      rejectedCategories: string[];
    };
  }
> = gql`
  mutation($data: TagCategoryAssociationAnswer!) {
    answerTagCategoryAssociation(data: $data) {
      _id
      name
      categories {
        _id
        name
      }
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
