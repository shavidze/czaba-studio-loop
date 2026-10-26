import json, sys
d = json.load(open(sys.argv[1]))
names = []
for r in d['testResults']:
    for a in r['assertionResults']:
        names.append(r['name'].split('__tests__/')[1] + ' :: ' + a['fullName'] + ' :: ' + a['status'])
names.sort()
open(sys.argv[2], 'w').write('\n'.join(names) + '\n')
print(d['numTotalTests'], d['numPassedTests'], d['numFailedTests'], len(d['testResults']))
