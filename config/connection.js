import 'dotenv/config';
import dns from 'node:dns'; // imports Node's DNS tools for looking up domain information.
dns.setServers(['1.1.1.1', '8.8.8.8']); // An address so we can connect to MongoDB
import mongoose from 'mongoose'; // imports mongoose to connect to and work with MongoDB.

mongoose.connect(process.env.MONGO_URI)

export default mongoose.connection;