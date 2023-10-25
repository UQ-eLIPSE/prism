USERNAME=$1
OUTPUT=$2

if [ ! $USERNAME ] || [ ! $OUTPUT ]
then
    echo "USAGE: $0 mango_username output_dir"
    exit 1
fi

scp -r $USERNAME@mango.eait.uq.edu.au:/home/groups/elipse-projects/Prism/AGCO360 $OUTPUT