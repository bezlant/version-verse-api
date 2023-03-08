import * as dotenv from 'dotenv'

dotenv.config()

// eslint-disable-next-line import/first
import app from './server'

app.listen(3001, () => {})
