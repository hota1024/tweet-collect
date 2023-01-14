import 'dotenv/config'
import { TwitterApi } from 'twitter-api-v2'
import fs from 'fs/promises'
import path from 'path'

const TWEETS_JSON_PATH = path.join(process.cwd(), 'tweets.json')

const getTweetsJson = async (): Promise<any[]> => {
  return await fs
    .readFile(TWEETS_JSON_PATH)
    .then((r) => r.toString())
    .then((t) => JSON.parse(t))
}

const setTweetsJson = async (json: any[]) => {
  await fs.writeFile(TWEETS_JSON_PATH, JSON.stringify(json, null, 2))
}

const waitFor = (ms: number) => new Promise((r) => setTimeout(r, ms))

const main = async () => {
  const client = new TwitterApi(process.env.BEARER_TOKEN as string)
  const user = await client.v2.userByUsername(process.env.USERNAME as string)
  let pagination_token: string | undefined = void 0

  while (true) {
    const result: any = await client.v2.get(`users/${user.data.id}/tweets`, {
      max_results: 100,
      exclude: 'retweets',
      pagination_token,
    })
    pagination_token = result.meta.next_token

    const tweets = await getTweetsJson()
    tweets.push(...result.data)
    await setTweetsJson(tweets)

    console.log(tweets.length, pagination_token)

    if (!pagination_token) {
      break
    }

    await waitFor(400)
  }
}

main()
