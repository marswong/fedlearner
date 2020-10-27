const router = require('@koa/router')();
const { Octokit } = require('@octokit/rest');
const SessionMiddleware = require('../middlewares/session');
const PaginationMiddleware = require('../middlewares/pagination');
const docker = require('../libs/docker');

const octokit = new Octokit();

/**
 * fetch image data from Docker Hub and generate release in schema
 *
 * @param {Array<Object>} releases - ref: https://developer.github.com/v3/repos/releases/#list-releases
 * @return {Array<Object>} - checkout `tests/fixtures/activity.js` for schema detail
 */
async function mapImageToRelease(releases) {
  const releaseMap = releases.reduce((total, current) => {
    total[current.tag_name] = current;
    return total;
  }, {});
  const tags = releases.map((x) => x.tag_name);
  const tasks = tags.map((x) => new Promise((resolve) => {
    (async () => {
      try {
        const res = await docker.getImage(x);
        resolve(res);
      } catch (err) {
        resolve(null);
      }
    })();
  }));
  const res = await Promise.all(tasks);
  return res.reduce((total, current) => {
    if (current) {
      const release = releaseMap[current.name];
      total.push({
        id: release.node_id,
        type: 'release',
        creator: release.author.login,
        created_at: release.published_at,
        ctx: {
          docker: current,
          github: release,
        },
      });
    }
    return total;
  }, []);
}

router.get('/api/v1/activities', SessionMiddleware, PaginationMiddleware, async (ctx) => {
  // type filter could be used someday
  // const { type } = ctx.query;
  // if (type === 'release') {}
  const options = {
    owner: 'marswong',
    repo: 'fedlearner',
  };

  if (ctx.pagination.limit > 0 && ctx.pagination.offset >= 0) {
    options.page = ctx.pagination.offset / ctx.pagination.limit + 1;
    options.per_page = ctx.pagination.limit;
  }

  let releases;

  try {
    // Github API limit:
    // rate limit: it'd be better to cache data at client for 1 hour
    // pagination: no count of data
    const { data } = await octokit.repos.listReleases(options);
    releases = data;
  } catch (err) {
    // Octokit limit: reponse with non-200 status would throw HTTPError
    ctx.status = err.status;
    ctx.body = {
      error: err.message,
    };
    return;
  }

  const data = await mapImageToRelease(releases);
  ctx.body = { data };
});

module.exports = router;
