#!/bin/bash
pub build -o docs
cd docs/web
mv * ../
cd ..
rm -r lib/
rm -r web/
cd ..
echo "Built and ready for deploy"

