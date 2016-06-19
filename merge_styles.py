#!/usr/bin/python
import json
import sys

from copy import deepcopy
from itertools import chain

OPACITY_DICT = {
    # all of these need lists of props just to support
    # the symbol edge case where we set two opacity props
    'background': ['background-opacity'],
    'fill': ['fill-opacity'],
    'line': ['line-opacity'],
    'symbol': ['icon-opacity', 'text-opacity'],
    'raster': ['raster-opacity'],
    'circle': ['circle-opacity']
}

OPACITY_PROPS = list(chain(*OPACITY_DICT.values()))

def process_layer(alllayers, prefix, layer, default=False):

    layer['id'] = '{}-{}'.format(prefix, layer['id'])
    if 'ref' in layer:
        refname = layer['ref']
        layer['ref'] = '{}-{}'.format(prefix, layer['ref'])
    layer['metadata'] = {
        'mapbox:group': prefix
    }
    for op in OPACITY_PROPS:
        if op in layer['paint']:
            layer['metadata']['orig-{}'.format(op)] = layer['paint'][op]

    if not default:
        # set 0 opacity on all non-default layers
        if 'type' in layer:
            ltype = layer['type']
        else:
            ref = layer['ref']
            # we don't know if ref layer has been changed already or not
            try:
                reflayer = list(filter(lambda l: l['id'] == ref, alllayers))[0]
            except:
                reflayer = list(filter(lambda l: l['id'] == refname, alllayers))[0]
            ltype = reflayer['type']
        for op in OPACITY_DICT[ltype]:
            layer['paint'][op] = 0
    return layer


def merge_styles(styles):

    with open(styles[0], 'r') as base:
        jb = json.load(base)
        jb_name = base.name.split('.')[0].split('/')[-1]

    merged = deepcopy(jb)
    merged['layers'] = []

    for layer in jb['layers']:
        l = process_layer(jb['layers'], jb_name, layer, default=True)
        merged['layers'].append(l)

    merged['metadata'] = {
        'mapbox:groups': {
            jb_name: {
                'name': jb_name,
                'collapsed': False
            }
        }
    }

    for stylename in styles[1:]:
        with open(stylename, 'r') as f:
            j = json.load(f)
            j_name = f.name.split('.')[0].split('/')[-1]

        for layer in j['layers']:
            l = process_layer(j['layers'], j_name, layer)
            merged['layers'].append(l)

        for name, source in j['sources'].items():
            if not name in merged['sources']:
                merged['sources'][name] = source

        merged['metadata']['mapbox:groups'][j_name] = {
            'name': j_name,
            'collapsed': False
        }

    with open('merged.json', 'w') as f:
        json.dump(merged, f, indent=4)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: merge_styles.py <base_style> <merge_style1> [merge_style2 [...merge_styleN]]')
        exit(-1)
    merge_styles(sys.argv[1:])
