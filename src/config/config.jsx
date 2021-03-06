import development from "./development.config";
import production from "./production.config";
import example from "./example.config";
import test from "./test.config.js"

const env = process.env.APP_ENV || 'test'; // defaulting to after ||

const config = {
  example,
  development,
  production,
  test
};

export default config[env]; 
