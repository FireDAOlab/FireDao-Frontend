import styled from "styled-components";

export default styled.div`
      .ant-form-item-control-input {
        border-radius: 50px;
        padding: 0 10px;
      }

      .ant-select:not(.ant-select-customize-input) {
        .ant-select-selector {
          border-radius: 25px;
        }
      }

      /* width: 100%; */
      overflow: hidden;
      flex-shrink: 0;
      flex-grow: 0;
      display: flex;
      .flex-title{
        display: flex;
        justify-content: space-between;
      }
      @media screen and (min-width: 1500px) {
        .content-box {
          display: flex;
          padding: 2em 0;
        }

        .panel-box {

        }

        .ant-form-item-label > label {
          font-size: 16px;
          color: rgba(138, 128, 128, 1);
          height: 40px;
        }

        .left-content {
          width: 50%;
          padding-right: 5%;
          /* position: relative; */

          .img-box {
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 5%;
            background: linear-gradient(136deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            padding: 10px;
            font-family: Squada One-Regular, Squada One;
            font-weight: 600;
            text-align: center;

            p {
              font-size: 23px;
              line-height: 50px;
            }

            img {
              box-shadow: 0 0 10px rgba(255, 255, 255, 0), 0 0 5px rgba(0, 0, 0, 1);
              display: inline-block;
              border: 1px solid rgba(255, 255, 255, 0.5);
              border-radius: 20px;
              width: 100%;

              margin: 0 auto;
            }
          }

        }

        .right {
          width: 50%;
          /* max-width: 500px; */
          display: flex;

          .form {
            margin-top: 0em;

            .button-box {
              margin-top: 7em;
            }

            .mint-fee {
              padding: 0 1em;
            }

            .subBtn {
              padding: 0 2em;
              border-radius: 50px;
              background: linear-gradient(32deg, #FF4E50 0%, #F9D423 100%);
            }

            .tip {
              margin-top: 3em;
              font-size: 16px;
              font-family: PingFangSCSemibold-, PingFangSCSemibold, sans-serif;
              font-weight: normal;
              color: #AC8989;
              line-height: 25px;
            }
          }
        }
      }


      @media screen and (max-width: 1500px) {
        .content-box {
          display: flex;
          padding: 2em 0;
        }

        .panel-box {

        }

        .ant-form-item-label > label {
          font-size: 13px;
          color: rgba(138, 128, 128, 1);
          height: 20px;
        }

        .left-content {
          width: 50%;
          padding-right: 5%;
          /* position: relative; */

          .img-box {
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 5%;
            background: linear-gradient(136deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            padding: 10px;
            font-family: Squada One-Regular, Squada One;
            font-weight: 600;
            text-align: center;

            p {
              font-size: 18px;
              line-height: 45px;
            }

            img {
              box-shadow: 0 0 10px rgba(255, 255, 255, 0), 0 0 5px rgba(0, 0, 0, 1);
              display: inline-block;
              border: 1px solid rgba(255, 255, 255, 0.5);
              border-radius: 20px;
              width: 100%;

              margin: 0 auto;
            }
          }

        }

        .right {
          width: 50%;
          /* max-width: 500px; */
          display: flex;

          .form {
            margin-top: 0em;

            .button-box {
              margin: 1.5em 0em;
            }

            .mint-fee {
              padding: 0 1em;
            }

            .subBtn {
              padding: 0 2em;
              border-radius: 50px;
              background: linear-gradient(32deg, #FF4E50 0%, #F9D423 100%);
            }

            .tip {
              margin-top: 1em;
              font-size: 13px;
              font-family: PingFangSCSemibold-, PingFangSCSemibold, sans-serif;
              font-weight: normal;
              color: #AC8989;
              line-height: 18px;
            }
          }
        }
      }



    `