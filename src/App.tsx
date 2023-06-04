import React, { useMemo, useCallback, useRef, useLayoutEffect, useState, useEffect, FC, Dispatch, SetStateAction, memo } from 'react'
// import axios from "axios";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, HeadersDefaults } from "axios";
import { Button, Grid } from "@mui/material";
type MouseEvent_<E = unknown> = React.MouseEvent<E, MouseEvent>


const env: string = 'local'

function App() {
  const [z, setZ] = useState<number[][]>([])
  const [labels, setLabels] = useState<number[]>([])

  useEffect(() => {
    const url = (() => {
      if (env == 'local') {
        return "http://127.0.0.1:8000/return_z"
      }
      else if (env == 'production') {
        return "https://mnist_ukr-1-x6245667.deta.app/rerurn_z"
      }
      else {
        return ''
      }
    })()

    console.log(url)
    axios.get(url).then((res) => {
      setZ(res.data.z)
    });
  }, [])
  useEffect(() => {
    const url = (() => {
      if (env == 'local') {
        return "http://127.0.0.1:8000/return_labels"
      }
      else if (env == 'production') {
        return "https://mnist_ukr-1-x6245667.deta.app/return_labels"
      }
      else {
        return ''
      }
    })()

    console.log(url)
    axios.get(url).then((res) => {
      console.log(res.data.labels)
      setLabels(res.data.labels)
    });
  }, [])

  const colorList = ['steelblue', 'blue', 'green', 'yellow', 'orange', 'cyan', 'magenta', 'gray', 'yellowgreen', 'peru']


  const width = 500
  const height = 500
  const imageWidth = 300
  const imageHeight = 300
  const [clickX, setclickX] = useState(-10000)
  const [clickY, setclickY] = useState(-10000)
  const [imageData, setImageData] = useState('');
  const [nearIndex, setNearIndex] = useState(-1)
  const [nearImageData, setNearImageData] = useState('');



  const onClick = (e: MouseEvent_) => {
    setclickX(e.nativeEvent.offsetX)
    setclickY(e.nativeEvent.offsetY)
    const data = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
    const url = (() => {
      if (env == 'local') {
        return "http://127.0.0.1:8000/click"
      }
      else if (env == 'production') {
        return "https://mnist_ukr-1-x6245667.deta.app/click"
      }
      else {
        return ''
      }
    })()
    axios.post(url, data)
      .then((response) => {
        console.log('click')
        console.log(url)
        console.log(response.data.nearNum)

        setImageData(response.data.image)
        setNearImageData(response.data.nearImage)
        setNearIndex(response.data.nearNum)

      })
      .catch(err => {
        console.log("err:", err);
      });
    let distMin = 10000
    let distMinIndex = -1

    for (let i = 0; i < Object.keys(z).length; i++) {
      if (((((z[i][0] + 1) / 2 * width) - (e.nativeEvent.offsetX)) ** 2 + (((z[i][1] * -1 + 1) / 2 * height) - (e.nativeEvent.offsetY)) ** 2) < distMin) {
        distMin = ((((z[i][0] + 1) / 2 * width) - (e.nativeEvent.offsetX)) ** 2 + (((z[i][1] * -1 + 1) / 2 * height) - (e.nativeEvent.offsetY)) ** 2)
        distMinIndex = i
      }
    }
    setNearIndex(distMinIndex)
    // setNearImage()

  }

  return (
    <Grid container display='flex' alignItems="center" justifyContent="center">
      <Grid item xs={1}>
        <Grid container display='flex' direction='column' alignItems="center" justifyContent="center">
          <Grid item>
            {/* <p>{nearIndex}</p> */}
            {(() => {
              return colorList.map((imass, index) => {
                return <p style={{ color: imass, fontSize: 33 }}><span color={imass} >{index}:{imass}</span></p>
              })
            })()}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={6}>
        <Grid container display='flex' direction='column' alignItems="center" justifyContent="center">
          <Grid item>
            <svg width={width} height={height} onClick={onClick}>
              <rect width={width} height={height} fill='None' stroke='black' strokeWidth={10}></rect>
              {(() => {
                if (z.length != 0 && labels.length != 0) {
                  return z.map((imass, index) => {
                    return (<circle cx={(imass[0] + 1) * width / 2} cy={(imass[1] * -1 + 1) * height / 2} r={5} fill={colorList[labels[index]]}></circle>)

                  })
                }
              })()}

              {(() => {
                if (clickX != -10000) {
                  return (<circle cx={clickX} cy={clickY} r={10} fill='red'></circle>)
                }
              })()}
              {(() => {
                if (nearIndex != -1) {
                  return (<circle cx={(z[nearIndex][0] + 1) * width / 2} cy={(z[nearIndex][1] * -1 + 1) * width / 2} r={7} fill={colorList[labels[nearIndex]]} stroke='black' strokeWidth={4}></circle>)
                }
              })()}
            </svg>
          </Grid>
        </Grid>

      </Grid>
      <Grid item xs={5}>
        <Grid container display='flex' direction='column' alignItems="center" justifyContent="center">
          <Grid item>
            {(() => {
              if (imageData) {
                return (<p style={{ textAlign: 'center' }} >生成した画像です</p>)
              }
              else {
                return (<p style={{ textAlign: 'center' }} >左のマップをクリックしたら，画像が生成されます</p>)
              }
            })()}
            {(() => {
              if (imageData) {
                return (<img width={imageWidth} height={imageHeight} src={`data:image/jpeg;base64,${imageData}`} />)
              }
            })()}
          </Grid>
          <Grid item>
            {(() => {
              if (imageData) {
                return (<p style={{ textAlign: 'center' }} >一番近くの画像です</p>)
              }
              else {
                return (<p style={{ textAlign: 'center' }} >左のマップをクリックしたら，一番近くの画像を表示します</p>)
              }
            })()}
            {(() => {
              if (imageData) {
                return (<img width={imageWidth} height={imageHeight} src={`data:image/jpeg;base64,${nearImageData}`} />)
              }
            })()}
          </Grid>
        </Grid>
      </Grid>

    </Grid>
  );
}

export default App;
