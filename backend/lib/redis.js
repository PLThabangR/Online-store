import Redis from "ioredis"
import dotenv from 'dotenv'

dotenv.config()
//export redis to use database
export const redis= new Redis(process.env.UPSTASH_REDIS_URL);

//await redis.set('foo', 'bar');

//process.env.UPSTASH_REDIS_URL