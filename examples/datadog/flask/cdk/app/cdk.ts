import { App, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  DockerImageFunction,
  DockerImageCode,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import * as path from "path";

const app = new App();

class LwaStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const lwa_lambda = new DockerImageFunction(this, id, {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../lambda-asset"),
        {
          cacheDisabled: true,
        },
      ),
      functionName: id + "-lambda",
      timeout: Duration.seconds(9),
    });

    const functionUrl = lwa_lambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "LambdaFunctionUrl", {
      value: functionUrl.url,
      description: "The Lambda Function URL",
    });

    lwa_lambda.addEnvironment(
      "AWS_LWA_LAMBDA_RUNTIME_API_PROXY",
      "127.0.0.1:9002",
    );

    lwa_lambda.addEnvironment("DD_TRACE_PARTIAL_FLUSH_MIN_SPANS", "1");
    lwa_lambda.addEnvironment("DD_TRACE_PARTIAL_FLUSH_ENABLED", "false");
    lwa_lambda.addEnvironment("DD_API_KEY", process.env.DD_API_KEY || "");
    lwa_lambda.addEnvironment("DD_SERVICE", id);
  }
}

new LwaStack(app, "lwa-stack", {});
