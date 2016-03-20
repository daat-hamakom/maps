#!/usr/bin/python
import json
import sys


def merge_styles(styles):
    with open(styles[0], 'r') as s1:
        j1 = json.load(s1)
    with open(styles[1], 'r') as s2:
        j2 = json.load(s2)

    merged = j1
    for layer in merged['layers']:
        layer['id'] = '{}-{}'.format(j1['id'], layer['id'])
        if 'metadata' in layer:
            del layer['metadata']

    for layer in j2['layers']:
        layer['id'] = '{}-{}'.format(j2['id'], layer['id'])
        merged['layers'].append(layer)
        if 'metadata' in layer:
            del layer['metadata']

    del merged['metadata']

    with open('merged.json', 'w') as f:
        json.dump(merged, f, indent=4)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: merge_styles.py <base_style> <merge_style1> [merge_style2 [...merge_styleN]]')
        exit(-1)
    merge_styles(sys.argv[1:])
