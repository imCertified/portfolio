import apiClient from "./api-client";
import { AmplifyUser } from '@aws-amplify/ui'; 

class HttpService {
  endpoint: string;
  user: AmplifyUser;

  constructor(endpoint: string, user: AmplifyUser) {
    this.endpoint = endpoint;
    this.user = user;
  }

  getLinks<T>(treeId: string) {
    const controller = new AbortController();

    const request = apiClient.get<T>(this.endpoint, {
      params: {
        user: treeId
      },
      // headers: {
      //   Authorization: this.user.getSignInUserSession()?.getIdToken().getJwtToken()
      // },
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort()};
  }

  // delete(id: number) {
  //   return apiClient.delete(this.endpoint + '/' + id);
  // }

  // add<T>(entity: T) {
  //   return apiClient.post(this.endpoint, entity);
  // }

  // update<T extends Entity>(updatedEntity: T) {
  //   return apiClient.patch(this.endpoint + "/" + updatedEntity.id, updatedEntity);
  // }
}

const create = (endpoint: string, user: AmplifyUser) => new HttpService(endpoint, user);

export default create;
