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

export const UPLOAD_IMAGE: DocumentNode<
  {
    uploadImage: {
      _id: string;
      filename: string;
      categories: {
        _id: string;
        name: string;
      }[];
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
      categories {
        _id
        name
      }
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

export const IMAGE_TAG_ASSOCIATIONS: DocumentNode<
  {
    image?: {
      _id: string;
      categoriesNotAnswered: {
        _id: string;
        name: string;
        tags: {
          _id: string;
          name: string;
          possibleTagAssociations: { _id: string; name: string }[];
        }[];
      }[];
    };
  },
  {
    image_id: string;
  }
> = gql`
  query($image_id: ObjectId!) {
    image(id: $image_id) {
      _id
      categoriesNotAnswered {
        _id
        name
        tags {
          _id
          name
          possibleTagAssociations {
            _id
            name
          }
        }
      }
    }
  }
`;

export const ANSWER_TAG_IMAGE_ASSOCIATION: DocumentNode<
  {
    answerTagImageAssociation?: {
      _id: string;
      categoriesNotAnswered: {
        _id: string;
        name: string;
        tags: {
          _id: string;
          name: string;
          possibleTagAssociations: { _id: string; name: string }[];
        }[];
      }[];
    };
  },
  {
    data: {
      category: string;
      image: string;
      tag: string;
      rejectedTags: string[];
    };
  }
> = gql`
  mutation($data: TagImageAssociationInput!) {
    answerTagImageAssociation(data: $data) {
      _id
      categoriesNotAnswered {
        _id
        name
        tags {
          _id
          name

          possibleTagAssociations {
            _id
            name
          }
        }
      }
    }
  }
`;

// export const RESULTS_TAG_IMAGE_ASSOCIATIONS: DocumentNode<{
//   resultsTagImageAssociations: {
//     _id: string;
//     image?: { _id: string };
//     category?: { _id: string };
//   }[];
// }> = gql`
//   query {
//     resultsTagImageAssociations {
//       _id
//       image {
//         _id
//       }
//       category {
//         _id
//       }
//     }
//   }
// `;

export const NOT_ANSWERED_TAGS: DocumentNode<{
  notAnsweredTags: {
    _id: string;
    name: string;
    possibleTagAssociations: {
      _id: string;
      name: string;
    }[];
  }[];
}> = gql`
  query {
    notAnsweredTags {
      _id
      name
      possibleTagAssociations {
        _id
        name
      }
    }
  }
`;

export const ANSWER_TAG_ASSOCIATION: DocumentNode<
  {
    answerTagAssociation: {
      _id: string;
      name: string;
      possibleTagAssociations: {
        _id: string;
        name: string;
      }[];
    }[];
  },
  {
    data: {
      tagMain: string;
      tagChosen: string;
      rejectedTags: string[];
    };
  }
> = gql`
  mutation($data: TagAssociationInput!) {
    answerTagAssociation(data: $data) {
      _id
      name
      possibleTagAssociations {
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

export const EDIT_OWN_IMAGE: DocumentNode<
  {
    editOwnImage?: {
      _id: string;
      filename: string;
      categories: {
        _id: string;
        name: string;
      }[];
    };
  },
  {
    data: { _id: string; categories: string[] };
  }
> = gql`
  mutation($data: EditOwnImage!) {
    editOwnImage(data: $data) {
      _id
      filename
      categories {
        _id
        name
      }
    }
  }
`;

// export const RESULTS_TAG_ASSOCIATIONS: DocumentNode<{
//   resultsTagAssociations: {
//     _id: string;
//     tagMain?: { _id: string };
//   }[];
// }> = gql`
//   query {
//     resultsTagAssociations {
//       _id
//       tagMain {
//         _id
//       }
//     }
//   }
// `;
