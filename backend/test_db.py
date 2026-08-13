import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://cmrslpx1b:l%40HdEvS%23)TR%267dC@api.srvr2px.cyberads.io:27017/?authSource=admin&readPreference=primary&ssl=false")

async def test_connection():
    print(f"Testing MongoDB connection to: {MONGO_URI}")
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    try:
        info = await client.admin.command('ping')
        print("✓ SUCCESS! Connected to MongoDB. Ping response:", info)
    except Exception as e:
        print("✗ CONNECTION FAILED:", e)

if __name__ == "__main__":
    asyncio.run(test_connection())
