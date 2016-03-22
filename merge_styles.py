#!/usr/bin/python
import json
import sys


def merge_styles(styles):
    with open(styles[0], 'r') as s1:
        j1 = json.load(s1)
        j1_name = s1.name.split('.')[0].split('/')[-1]
    with open(styles[1], 'r') as s2:
        j2 = json.load(s2)
        j2_name = s2.name.split('.')[0].split('/')[-1]

    merged = j1
    for layer in merged['layers']:
        layer['id'] = '{}-{}'.format(j1_name, layer['id'])
        if 'ref' in layer:
            layer['ref'] = '{}-{}'.format(j1_name, layer['ref'])
        layer['metadata'] = {
            'mapbox:group': j1_name
        }

    for layer in j2['layers']:
        layer['id'] = '{}-{}'.format(j2_name, layer['id'])
        if 'ref' in layer:
            layer['ref'] = '{}-{}'.format(j2_name, layer['ref'])
        merged['layers'].append(layer)
        layer['metadata'] = {
            'mapbox:group': j2_name
        }

    for name, source in j2['sources'].items():
        if not name in merged['sources']:
            merged['sources'][name] = source


    merged['metadata'] = {
        'mapbox:groups': {
            j1_name: {
                'name': j1_name,
                'collapsed': False
            },
            j2_name: {
                'name': j2_name,
                'collapsed': False
            }
        }
    }

    with open('merged.json', 'w') as f:
        json.dump(merged, f, indent=4)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: merge_styles.py <base_style> <merge_style1> [merge_style2 [...merge_styleN]]')
        exit(-1)
    merge_styles(sys.argv[1:])
