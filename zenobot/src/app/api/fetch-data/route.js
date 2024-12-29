import connectDB from '../../lib/dbConnect';
import ResponseModel from '../../models/Response';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const data = await ResponseModel.find({});
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send({ error: 'Server error' });
  }
}