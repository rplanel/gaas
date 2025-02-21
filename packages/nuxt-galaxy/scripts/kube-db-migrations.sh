#!/bin/bash

for file in $1/*; do
  clipboard+="    $(basename $file): |\n"
  clipboard+=$(cat $file | awk '{print "      "$0}')
  clipboard+="\n"
done

echo -e "$clipboard"