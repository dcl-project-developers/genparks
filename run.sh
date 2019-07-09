#!/bin/bash
#

####### run.sh <start_park_number> <end_park_number>

# start park number
if [ -z "$1" ]
  then
    echo "No Start Park Supplied (arg 1)"
    exit 1
fi
start_park_number=$1
echo "Start Park number: $start_park_number"

# end park number
if [ -z "$2" ]
  then
    echo "No End Park Supplied (arg 2)"
    exit 1
fi
end_park_number=$2
echo "End Park number: $end_park_number"

for ((i=$start_park_number; i<=$end_park_number; i+=1));
do
  echo ""
  echo "--"
  echo "Generating park number $i"

  generate_cmd="./genparks.js new $i"
  eval $generate_cmd

done