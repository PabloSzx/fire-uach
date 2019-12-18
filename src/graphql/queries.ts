import gql, { DocumentNode } from "graphql-tag-ts";

export type IUser = {
  _id: string;
  email: string;
  admin: boolean;
  imagesUploaded: { _id: string; filename: string }[];
};

export const UserFragment = gql`
  fragment UserFragment on User {
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
      ...UserFragment
    }
  }
  ${UserFragment}
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
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const SIGN_UP: DocumentNode<
  {
    signUp: IUser;
  },
  {
    data: {
      email: string;
      password: string;
    };
  }
> = gql`
  mutation($data: SignUpInput!) {
    signUp(data: $data) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const UPLOAD_IMAGE: DocumentNode<
  {
    uploadImage: {
      _id: string;
      filename: string;
    };
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
  validatedImages: { _id: string; filename: string }[];
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
