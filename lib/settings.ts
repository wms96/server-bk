import { readFileSync } from "fs-extra"
import { toSafeInteger } from "lodash"
import YAML from "yaml"
import { Server } from "../config/types/server"

const file = readFileSync("config/server.yml", "utf8")
const configFile = <Server>YAML.parse(file, { strict: false })

const mapEnvVariables = (value: unknown) => {
  if (typeof value === "string" && value.includes("${")) {
    const [env, defaultValue = ""] = value.slice(2, -1).split(":")

    const getEnv = process.env[env]

    // If it's not a number, remove the quotes.
    const defaultValueString = defaultValue.includes('"', 0)
      ? defaultValue.slice(1, -1)
      : defaultValue

    const getString = defaultValueString.length > 0 ? defaultValueString : ""
    const getValue = `${getEnv || getString}`

    const intValue = toSafeInteger(getValue)
    const booleanValue =
      getValue === "true" || getValue === "false" ? false : null
    const getParsedValue =
      intValue.toString() === getValue ? intValue : booleanValue || getValue

    return getParsedValue
  }

  return value
}

// Parsing environment variables
const config = Object.fromEntries(
  Object.entries(configFile).map(([key, value]) => [
    key,
    mapEnvVariables(value),
  ])
) as unknown as Server

const { dbHost, dbPort, dbName, dbUser, dbPass, dbUrl } = config

const dbCred =
  dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : ""

const dbURL = 'mongodb+srv://ramy:2PEmQyVH3b1lxSXC@cluster0.ibufg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' 
export const mongodbConnection = dbURL

export default config
