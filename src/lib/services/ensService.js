function isEnsDomain(s) {
  const match = s.match(/^[a-zA-z0-9.]+\.eth$/);
  const split = s.split('.');
  return match && !split.includes('');
}

module.exports.isEnsDomain = isEnsDomain;
