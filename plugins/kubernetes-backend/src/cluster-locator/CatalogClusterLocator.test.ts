/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '@backstage/backend-common';
import {
  ANNOTATION_KUBERNETES_AUTH_PROVIDER,
  ANNOTATION_KUBERNETES_AWS_ASSUME_ROLE,
  ANNOTATION_KUBERNETES_AWS_EXTERNAL_ID,
  ANNOTATION_KUBERNETES_OIDC_TOKEN_PROVIDER,
} from '@backstage/plugin-kubernetes-common';
import { CatalogClusterLocator } from './CatalogClusterLocator';
import { CatalogApi } from '@backstage/catalog-client';

const mockCatalogApi = {
  getEntityByRef: jest.fn(),
  getEntities: async () => ({
    items: [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Resource',
        metadata: {
          annotations: {
            'kubernetes.io/api-server': 'https://apiserver.com',
            'kubernetes.io/api-server-certificate-authority': 'caData',
            [ANNOTATION_KUBERNETES_AUTH_PROVIDER]: 'oidc',
            [ANNOTATION_KUBERNETES_OIDC_TOKEN_PROVIDER]: 'google',
            'kubernetes.io/skip-metrics-lookup': 'true',
            'kubernetes.io/skip-tls-verify': 'true',
            'kubernetes.io/dashboard-url': 'my-url',
            'kubernetes.io/dashboard-app': 'my-app',
          },
          name: 'owned',
          title: 'title',
          namespace: 'default',
        },
      },
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Resource',
        metadata: {
          annotations: {
            'kubernetes.io/api-server': 'https://apiserver.com',
            'kubernetes.io/api-server-certificate-authority': 'caData',
            [ANNOTATION_KUBERNETES_AUTH_PROVIDER]: 'aws',
            [ANNOTATION_KUBERNETES_AWS_ASSUME_ROLE]: 'my-role',
            [ANNOTATION_KUBERNETES_AWS_EXTERNAL_ID]: 'my-id',
            [ANNOTATION_KUBERNETES_OIDC_TOKEN_PROVIDER]: 'google',
            'kubernetes.io/dashboard-url': 'my-url',
            'kubernetes.io/dashboard-app': 'my-app',
          },
          name: 'owned',
          namespace: 'default',
        },
      },
    ],
  }),
} as unknown as CatalogApi;

describe('CatalogClusterLocator', () => {
  it('returns empty cluster details when the cluster is empty', async () => {
    const emptyMockCatalogApi = {
      getEntityByRef: jest.fn(),
      getEntities: async () => ({
        items: [],
      }),
    } as Partial<CatalogApi> as CatalogApi;

    const clusterSupplier =
      CatalogClusterLocator.fromConfig(emptyMockCatalogApi);

    const result = await clusterSupplier.getClusters();

    expect(result).toHaveLength(0);
    expect(result).toStrictEqual([]);
  });

  it('returns the cluster details provided by annotations', async () => {
    const clusterSupplier = CatalogClusterLocator.fromConfig(mockCatalogApi);

    const result = await clusterSupplier.getClusters();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchSnapshot();
  });

  it('returns the aws cluster details provided by annotations', async () => {
    const clusterSupplier = CatalogClusterLocator.fromConfig(mockCatalogApi);

    const result = await clusterSupplier.getClusters();

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchSnapshot();
  });
});
