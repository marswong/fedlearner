/**
 * Docker Registry HTTP API V2 Client
 *
 * Reference: https://hub.docker.com
 */

const ky = require('ky-universal');
const parseStream = require('../utils/parse_stream');

const parseErrorResponse = async (e) => {
  if (e && e.response && e.response.body) {
    const body = await parseStream(e.response.body);
    if (body && body.error) {
      const error = new Error(body.error);
      error.status = e.response.status;
      throw error;
    }
  }
  throw e;
}

class DockerClient {
  constructor() {
    const prefixUrl = 'https://hub.docker.com/v2';
    this.image = 'fedlearner/fedlearner-web-console';
    this.prefixUrl = prefixUrl;
    this.client = ky.create({
      prefixUrl,
    });
  }

  getBaseUrl() {
    return this.prefixUrl;
  }

  /**
   * get image detail
   * @param {string} name
   * @param {string} repo - registered image name from Docker Hub, default to 'fedlearner/fedlearner-web-console'
   * @param {Promise<object>} - { creator, id, image_id, images, last_updated, last_updater, last_updater_username, name, repository, full_size, v2 }
   */
  async getImage(name, repo = this.image) {
    const response = await this.client.get(`repositories/${repo}/tags/${name}`).catch(parseErrorResponse);
    return response.json();
  }

  /**
   * search image tags for image
   *
   * @param {string} repo - registered image name from Docker Hub, default to 'fedlearner/fedlearner-web-console'
   * @param {string} name - docker image tag, used for tag search
   * @param {number} page - current list page
   * @param {number} page_size - list size
   * @param {Promise<object>} - { count, next, previous, results }
   */
  async listImageTags(repo = this.image, name = '', page = 1, page_size = 10) {
    const response = await this.client.get(`repositories/${repo}/tags`, { name, page, page_size }).catch(parseErrorResponse);
    return response.json();
  }
}

module.exports = new DockerClient();
