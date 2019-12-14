import gql, { DocumentNode } from "graphql-tag-ts";

export const CURRENT_USER: DocumentNode<{
  currentUser?: {
    _id: string;
    email: string;
  };
}> = gql`
  query {
    currentUser {
      _id
      email
    }
  }
`;

export const LOGIN: DocumentNode<
  {
    login: {
      _id: string;
      email: string;
    };
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
      _id
      email
    }
  }
`;

export const SIGN_UP: DocumentNode<
  {
    signUp: {
      _id: string;
      email: string;
    };
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
      _id
      email
    }
  }
`;
