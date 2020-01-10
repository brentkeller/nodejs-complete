const deleteProduct = el => {
  const prodId = el.parentNode.querySelector('[name=productId]').value;
  const csrf = el.parentNode.querySelector('[name=_csrf]').value;
  fetch(`/admin/product/${prodId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then(result => {
      return result.json();
    })
    .then(_data => {
      const productElement = el.closest('article');
      productElement.parentNode.removeChild(productElement);
    })
    .catch(err => console.log(err));
};
