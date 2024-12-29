import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';
import connectDB from '@/lib/dbConnect.js';
import ResponseModel from '@/models/Response.model.js';

const ollama = new Ollama({
  model: 'zenobot01',
  baseUrl: 'http://localhost:11434',
});

const saveQueryResponse = async (query, answer) => {

  // Implement try catch block here
  try {
    const newResponse = new ResponseModel({ query, answer });
    const savedResponse = await newResponse.save();
    console.log('Response saved successfully');
    return savedResponse;
  } catch (error) {
    console.error('Error saving response:', error.message);
  }
};

export async function POST(req) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    await connectDB();

    const response = await ollama.generate({
      model: 'zenobot01',
      prompt: query,
    });
    const responseText = response.response;

    if(responseText){
      console.log('Response generated successfully');
    }
    const cleanedResponse = responseText.replace(/^```(?:json)?\n|```$/g, '');

    const savedResponse = await saveQueryResponse(query, cleanedResponse);

    if(savedResponse){
      console.log('Response saved successfully', savedResponse);
    }else{
      console.error('Error saving response');
    }

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error('Error interacting with the model:', error.message);
    return NextResponse.json({ error: 'Model not found or server error' }, { status: 500 });
  }
}