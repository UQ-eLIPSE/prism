DB=andrew_liveris

collections=(areas categories minimapimages minimapconversions minimapnodes resources subcategories surveynodes surveys types users)

for i in "${collections[@]}"; do
	mongoexport --collection=$i --db=$DB --out=$i.json --forceTableScan
done
