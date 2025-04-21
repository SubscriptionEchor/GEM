#!/bin/bash

mkdir nodejs
cd nodejs
npm install jsonwebtoken @supabase/supabase-js --production
cd ..
zip -r nodejs.zip nodejs
rm -rf nodejs