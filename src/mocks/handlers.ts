import { http, HttpResponse } from 'msw'
import { productsList } from './dataMock'

export const handlers = [
/*   http.post(/^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-.*:generateContent/, () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify(productsList)
              }
            ]
          }
        }
      ]
    });
  }) */
];