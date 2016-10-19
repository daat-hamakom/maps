import moment from 'moment'

function _cleanDates (ds, de) {
  var sd = ''
  var ed = ''

  if (de != '') {
    ed = de.replace('-00-', '-12-').replace('-00', '-28').replace('0000', '2000')
  }
  else {
    if (ds.includes('-00-')) {
      ed = ds.replace('-00-', '-12-').replace('-00', '-31')
    }
    else {
      if (ds.includes('-00')) {
        ed = ds.replace('-00', '-28')
      }
      else {
        ed = moment(ds, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD')
      }
    }
  }

  ds = ds.replace('-00-', '-01-').replace('-00', '-01').replace('0000', '2000')

  // var sd = moment(ds, 'YYYY-MM-DD')
  // var ed = moment(ed, 'YYYY-MM-DD')

  return { sd: ds, ed: ed }
}

export function cleanDates (ev) {
  const res = _cleanDates(ev.start_date, ev.end_date)
  ev.start_date_orig = ev.start_date
  ev.end_date_orig = ev.end_date

  ev.start_date = res.sd
  ev.end_date = res.ed
  return ev
}
