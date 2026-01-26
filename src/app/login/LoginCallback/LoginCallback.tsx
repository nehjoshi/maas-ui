import { useEffect, useRef } from "react";

import {
  Col,
  Notification,
  Row,
  Spinner,
  Strip,
} from "@canonical/react-components";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import { useCreateSession, useGetCallback } from "@/app/api/query/auth";
import PageContent from "@/app/base/components/PageContent";
import urls from "@/app/base/urls";
import { statusActions } from "@/app/store/status";

export const LoginCallback = (): React.ReactElement => {
  const dispatch = useDispatch();
  const createSession = useCreateSession();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  const callback = useGetCallback({
    query: {
      code: code || "",
      state: state || "",
    },
  });

  const hasHandledSuccess = useRef(false);

  useEffect(() => {
    if (!callback.isSuccess || hasHandledSuccess.current) return;

    hasHandledSuccess.current = true;

    (async () => {
      await createSession.mutateAsync({});
      dispatch(statusActions.loginSuccess());
      navigate(urls.machines.index, { replace: true });
    })();
  }, [callback.isSuccess, createSession, dispatch, navigate]);

  return (
    <PageContent>
      <Strip>
        <Row>
          <Col emptyLarge={4} size={6}>
            {!callback.isPending && (!code || !state) && (
              <Notification role="alert" severity="information">
                Missing code or state in the callback URL.
              </Notification>
            )}
            {code && state && callback.isPending && (
              <Spinner aria-label={"Loading..."} text="Loading..." />
            )}
            {callback.isError && (
              <Notification role="alert" severity="negative">
                An error occurred during authentication. Please try logging in
                again.
              </Notification>
            )}
          </Col>
        </Row>
      </Strip>
    </PageContent>
  );
};

export default LoginCallback;
