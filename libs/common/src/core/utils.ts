import { stringify as uuidStringify } from 'uuid';

export const uuidBufferToString = (input: Buffer) => {
  let result;

  try {
    result = uuidStringify(input);
  } catch {
    result = input.toString('utf-8');
  }

  return result;
};

// rabitMq.listen((msg) => {
//   if msg.id exist a {
//     a[msg.id].resolve(msg)
//   }
// })

// function get() {

//   promise1 = call1()
//   promíe2 = call2()

//   a.push(reqId1, promise1)
//   a.push(reqId2, promise1)

//   await Promise.all([promise1, promise2])
//   fwf
// }

// call1(reqId1)) {
//   var p = new Promise<T>()
//   sendMsgtoRB()
//   rabitMq.addListener(msg => {
//     if msg.id exist a {
//     p.resolve(msg)
//   }
//   setTimeout(() => { p.resolve(null)), 1000)
//   return p
//   })
// }

// const user = getUser()
//  {
//   _id: ...
//   name:
//   savedPlaces: [id1, id2, id3]
//  }

// const places = getPlaces(user.savedPlaces);
