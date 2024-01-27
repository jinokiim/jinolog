---
title: "Preview Mode for Static Generation"
excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent elementum facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui accumsan sit amet nulla facilities morbi tempus."
coverImage: "/assets/blog/preview/cover.jpg"
date: "2020-03-16T05:35:07.322Z"
author:
  name: Joe Haddad
  picture: "/assets/blog/authors/joe.jpeg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
---

**memo**는 props가 변경되지 않았다면 컴포넌트의 재렌더링을 건너뛴다.

```
const MemoizedComponent = memo( SomeComponent, arePropsEqual? )
```

- Useage
- - props가 변경되지 않았을때 재렌더링 skip
  - state를 사용하여 memo화된 컴포넌트 update
  - context를 사용하여 memo화된 컴포넌트 update
  - props 변화 최소화
  - custom comparison 함수 지정
- Reference
  - memo(Component, arePropsEqual?)

---

# Useage

## props가 변경되지 않았을때 재렌더링 skip

React는 일반적으로 부모가 재렌더링 될 때마다 컴포넌트를 다시 렌더링한다. memo를 사용하면 새 props가 이전 props와 동일한 부모가 재렌더링 될때 React가 재렌더링 하지 않는 컴포넌트를 만들 수 있다. 이러한 컴포넌트를 memoized 되었다고 한다.

컴포넌트를 memo화 하려면 memo로 감싸고 원래 컴포넌트 대신 반환 값을 사용한다.

```javascript
const Greeting = memo(function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
});

export default Greeting;
```

React 컴포넌트에는 항상 순수한 렌더링 로직이 있어야 한다. 즉, props, state, context가 변하지 않았다면 return도 동일해야 한다. memo를 사용하여 컴포넌트 컴파일시에 React에 해당 조건을 전달하면, React는 props가 변화하지 않았다면 재렌더링할 필요가 없다는 것을 안다.

아래 예시에서, Greeting컴포넌트는 name이 변경될때 재렌더링된다. 그러나 address가 변경되면 재렌더링 되지 않는다.

```
import { memo, useState } from 'react';

export default function MyApp() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  return (
    <>
      <label>
        Name{': '}
        <input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Address{': '}
        <input value={address} onChange={e => setAddress(e.target.value)} />
      </label>
      <Greeting name={name} />
    </>
  );
}

const Greeting = memo(function Greeting({ name }) {
  console.log("Greeting was rendered at", new Date().toLocaleTimeString());
  return <h3>Hello{name && ', '}{name}!</h3>;
});
```

> memo는 퍼포먼스의 최적화로만 사용해야한다. memo가 없이 동작하지 않으면 다른 문제를 찾아 먼저 고쳐야 한다. 그리고 memo를 이용해 퍼포먼스를 개선하자.

---

## state를 사용하여 memo화된 컴포넌트 update

컴포넌트가 메모이제이션 된 경우에도 자체 state가 변경되면 재렌더링된다. 메모이제이션은 부모에서 컴포넌트로 전달되는 props에만 관련이 있다.

```
import { memo, useState } from 'react';

export default function MyApp() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  return (
    <>
      <label>
        Name{': '}
        <input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Address{': '}
        <input value={address} onChange={e => setAddress(e.target.value)} />
      </label>
      <Greeting name={name} />
    </>
  );
}

const Greeting = memo(function Greeting({ name }) {
  console.log('Greeting was rendered at', new Date().toLocaleTimeString());
  const [greeting, setGreeting] = useState('Hello');
  return (
    <>
      <h3>{greeting}{name && ', '}{name}!</h3>
      <GreetingSelector value={greeting} onChange={setGreeting} />
    </>
  );
});

function GreetingSelector({ value, onChange }) {
  return (
    <>
      <label>
        <input
          type="radio"
          checked={value === 'Hello'}
          onChange={e => onChange('Hello')}
        />
        Regular greeting
      </label>
      <label>
        <input
          type="radio"
          checked={value === 'Hello and welcome'}
          onChange={e => onChange('Hello and welcome')}
        />
        Enthusiastic greeting
      </label>
    </>
  );
}
```

state값을 현재 값으로 설정하면 React는 memo없이 재렌더링을 건너뛴다. 컴포넌트 함수가 추가시간에도 불리는것을 확인할 수 있지만, 결과는 무시된다.

---

## context를 사용하여 memo화된 컴포넌트 update

컴포넌트가 메모이제이션 된 경우에도 사용중인 context가 변경되면 재렌더링된다. 메모이제이션은 부모에서 컴포넌트로 전달되는 props만 관련이 있다.

```
import { createContext, memo, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export default function MyApp() {
  const [theme, setTheme] = useState('dark');

  function handleClick() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={handleClick}>
        Switch theme
      </button>
      <Greeting name="Taylor" />
    </ThemeContext.Provider>
  );
}

const Greeting = memo(function Greeting({ name }) {
  console.log("Greeting was rendered at", new Date().toLocaleTimeString());
  const theme = useContext(ThemeContext);
  return (
    <h3 className={theme}>Hello, {name}!</h3>
  );
});
```

만약 context의 일부분이 변경될 때만 재렌더링 하고 싶다면, 컴포넌트를 두 개로 나누면 된다. 외부 컴포넌트의 context에서 필요한 내용을 읽고 메모화된 자식에게 props로 전달한다.

---

## props 변화 최소화

memo를 사용하면, 컴포넌트는 props가 이전과 조금이라도 다르면 재렌더링된다. 이는 React가 컴포넌트의 모든 props를 비교할때 이전 props와 Object.is 비교를 하는것을 의미한다.

> Object.is(3, 3) 는 true / Object.is( { }, { } ) 는 false 이다.

memo를 최대한 활용하려면 props가 변경되는 횟수를 최소화해야한다. 예를 들면, props가 object 안에있으면, useMemo를 사용하여 부모 컴포넌트가 매번 해당 object를 만들지 않도록 해야한다.

```
function Page() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);

  const person = useMemo(
    () => ({ name, age }),
    [name, age]
  );

  return <Profile person={person} />;
}

const Profile = memo(function Profile({ person }) {
  // ...
});
```

props 변경을 최소화 하는 더 좋은 방법은 컴포넌트가 props의 최소한의 정보를 받는 것 이다. 예를 들어, object 그대로 받지 말고 개별적인 값으로 받을 수 있다.

```
function Page() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);
  return <Profile name={name} age={age} />;
}

const Profile = memo(function Profile({ name, age }) {
  // ...
});
```

개별적인 값도 자주 변경되지 않는 값으로 투영될 수 있다. 예를 들어, 여기 컴포넌트는 값 자체가 아닌 값의 존재 유무를 나타내는 boolean을 받는다.

```
function GroupsLanding({ person }) {
  const hasGroups = person.groups !== null;
  return <CallToAction hasGroups={hasGroups} />;
}

const CallToAction = memo(function CallToAction({ hasGroups }) {
  // ...
});
```

메모화된 컴포넌트에 함수를 전달해야할 경우 변경되지 않도록 컴포넌트 외부에서 선언하거나 useCallback으로 재렌더링하는 사이에 cache한다.

---

## custom comparison 함수 지정

드물게, 메모화된 컴포넌트의 props 변경을 최소화 하는것이 불가능 할 수 있다. 이 경우 React가 얕은 비교를 하는 대신 새로운 props 와 이전의 props를 비교할 custom 비교 함수를 사용한다. 이 함수는 memo의 두 번째 인수로 전달된다. 새 props가 이전 props와 동일한 결과를 출력하는 경우에 true가 반환된다.

```
const Chart = memo(function Chart({ dataPoints }) {
  // ...
}, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.dataPoints.length === newProps.dataPoints.length &&
    oldProps.dataPoints.every((oldPoint, index) => {
      const newPoint = newProps.dataPoints[index];
      return oldPoint.x === newPoint.x && oldPoint.y === newPoint.y;
    })
  );
}
```

이 경우 브라우저 개발자 도구의 Performance 패널을 사용하여 재렌더링할 경우와 속도비교를 해보자.

---

## Reference

### memo(Component, arePropsEqual?)

메모화된 컴포넌트를 정의하려면 바깥 컴포넌트에서 memo를 호출해라. 이 메모화된 컴포넌트는 일반적으로 props가 변경되지 않는 한 부모 컴포넌트가 재렌더링될 때 재렌더링 되지 않는다. 그러나 React는 그것들을 재렌더링 수 있다. (메모화는 성능 최적화를 항상 보장하는것이 아니다.)

```
import { memo } from 'react';

function SomeComponent(props) {
  // ...
}

const MemoizedComponent = memo(SomeComponent);
```

### Parameters

- Component : 메모화 하고싶은 컴포넌트. memo는 컴포넌트를 수정하지 않고 새로운 메모화된 컴포넌트를 반환한다. 함수와 forwardRef컴포넌트와 같은 모든 유효한 React 컴포넌트가 포함된다.
- optional arePropsEqual : 두 가지 인수를 허용하는 함수 : 컴포넌트의 이전 props, 그리고 새로운 props. 이전과 새로운 props가 동일하면 true를 반환한다. 아니라면 false를 반환한다.

### Returns

memo는 새로운 React 컴포넌트를 반환한다. props가 변경되지 않는 한 memo가 예상한 동일한 컴포넌트를 제공해 부모가 재렌더링 될때 React가 항상 재렌더링 하지 않는다.

출처 : [https://react.dev/reference/react/memo](https://react.dev/reference/react/memo)
