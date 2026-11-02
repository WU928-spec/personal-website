const secretLink = document.getElementById('secret-link')
if (secretLink && localStorage.getItem('wuspace-starry-complete') === 'true') {
  secretLink.hidden = false
}

for (const star of document.querySelectorAll('.star-point')) {
  star.addEventListener('click', () => {
    localStorage.setItem('wuspace-starry-complete', 'true')
  })
}
